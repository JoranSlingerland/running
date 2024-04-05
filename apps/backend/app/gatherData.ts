import {
  getLastActivityFromCosmos,
  upsertUserSettingsToCosmos,
  userSettingsFromCosmos,
} from '@repo/cosmosdb';
import { addActivitiesToQueue } from '@repo/queue-helpers';
import { StravaClient } from '@repo/strava';
import { Activity, UserSettings } from '@repo/types';
import {
  ActivityHandler,
  OrchestrationContext,
  OrchestrationHandler,
} from 'durable-functions';

import { cleanUpSummaryActivity } from '../lib/cleanup';

const gatherData: OrchestrationHandler = function* (
  context: OrchestrationContext,
) {
  const userId = (context.df.getInput() as { id: string }).id;

  console.info('Step 1: Fetching user data');
  const userSettings: UserSettings = yield context.df.callActivity(
    'getUserSettings',
    userId,
  );

  console.info('Step 2: Fetching user activities');
  const activities: Activity[] = yield context.df.callActivity(
    'getActivities',
    userSettings,
  );

  console.info('Step 3: Outputting data to CosmosDB');
  const id = 0;
  const childId = `${context.df.instanceId}:${id}`;
  const provisioningTask = context.df.callSubOrchestrator(
    'subOrchOutputToCosmosDb',
    {
      activities: activities,
    },
    childId,
  );
  yield context.df.Task.all([provisioningTask]);

  console.info('Step 4: Adding activity id to enrichment queue');
  yield context.df.callActivity('addActivityToEnrichmentQueue', [
    'enrichment-queue',
    activities,
  ]);

  return { status: 'success', ActivitiesAdded: activities.length };
};

const getUserSettings: ActivityHandler = async (id: string) => {
  const userSettings = await userSettingsFromCosmos(id);
  if (!userSettings) {
    throw new Error('User not found');
  }
  return userSettings;
};

const getActivities: ActivityHandler = async (userSettings: UserSettings) => {
  const latestActivityDate = await getLastActivityFromCosmos(userSettings.id);

  const stravaClient = new StravaClient(userSettings.strava_authentication);
  const auth = await stravaClient.initialize();

  upsertUserSettingsToCosmos({
    ...userSettings,
    strava_authentication: auth,
  });

  let epochStartDate = 0;
  if (latestActivityDate?.start_date) {
    epochStartDate = new Date(latestActivityDate.start_date).getTime() / 1000;
  }

  const activities = await stravaClient.getActivities({
    after: epochStartDate,
  });

  if (!activities || activities.length === 0) {
    return [];
  }

  return activities.map((activity) =>
    cleanUpSummaryActivity(activity, userSettings.id),
  );
};

const addActivityToEnrichmentQueue: ActivityHandler = async (
  payload: [string, Activity[]],
) => {
  const queueName = payload[0];
  const activities = payload[1];

  return await addActivitiesToQueue(queueName, activities);
};

export {
  getUserSettings,
  gatherData,
  getActivities,
  addActivityToEnrichmentQueue,
};
