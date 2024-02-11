import {
  getLastActivityFromCosmos,
  userSettingsFromCosmos,
} from '@repo/cosmosdb';
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
  console.info('Latest activity date:', latestActivityDate);
  return latestActivityDate;
};

export { getUserSettings, gatherData, getActivities };
