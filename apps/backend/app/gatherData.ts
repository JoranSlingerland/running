import {
  getLastActivityFromCosmos,
  upsertUserSettingsToCosmos,
  userSettingsFromCosmos,
} from '@repo/cosmosdb';
import { StravaClient } from '@repo/strava';
import { UserSettings } from '@repo/types';
import {
  ActivityHandler,
  OrchestrationContext,
  OrchestrationHandler,
} from 'durable-functions';

const gatherData: OrchestrationHandler = function* (
  context: OrchestrationContext,
) {
  const userId = (context.df.getInput() as { id: string }).id;

  console.info('Step 1: Fetching user data');
  const userSettings: UserSettings = yield context.df.callActivity(
    'getUserSettings',
    userId,
  );

  const activities = yield context.df.callActivity(
    'getActivities',
    userSettings,
  );

  console.info('Step 2: Fetching user activities');

  return activities;
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

  return await stravaClient.getActivities({
    after: latestActivityDate?.start_date,
  });
};

export { getUserSettings, gatherData, getActivities };
