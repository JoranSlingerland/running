import {
  getLastActivityFromCosmos,
  upsertUserSettingsToCosmos,
  userSettingsFromCosmos,
} from '@repo/cosmosdb';
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

  return 'done';
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

  const activities = await stravaClient.getActivities({
    after: latestActivityDate?.start_date,
  });

  if (!activities || activities.length === 0) {
    return [];
  }

  return activities.map((activity) =>
    cleanUpSummaryActivity(activity, userSettings.id),
  );
};

export { getUserSettings, gatherData, getActivities };
