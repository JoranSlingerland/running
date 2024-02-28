import {
  upsertUserSettingsToCosmos,
  upsertWithBackOff,
  userSettingsFromCosmos,
} from '@repo/cosmosdb';
import { DetailedActivity, StravaClient, Stream } from '@repo/strava';

import { cleanupDetailedActivity } from '../lib/cleanup';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const QUARTER_HOUR = 15 * MINUTE;
const SLEEP_INTERVAL = 30 * SECOND;

async function enrichActivity(queueItem: unknown): Promise<void> {
  if (
    !queueItem ||
    typeof queueItem !== 'object' ||
    !('activityId' in queueItem) ||
    !('userId' in queueItem) ||
    typeof queueItem.activityId !== 'number' ||
    typeof queueItem.userId !== 'string'
  ) {
    console.warn('Invalid queue item:', queueItem);
    return;
  }

  const { activityId, userId } = queueItem;
  const userSettings = await userSettingsFromCosmos(userId);

  if (!userSettings) {
    console.warn('User not found:', userId);
    return;
  }

  const stravaClient = new StravaClient(userSettings.strava_authentication);
  const auth = await stravaClient.initialize();
  upsertUserSettingsToCosmos({
    ...userSettings,
    strava_authentication: auth,
  });

  let activity: DetailedActivity;
  let stream: Stream;

  try {
    activity = await stravaClient.getActivity({ id: activityId });
  } catch (error) {
    console.error('Error fetching activity:', error);
    handleRateLimitExceeded();
    throw new Error('Error fetching activity');
  }

  try {
    stream = await stravaClient.getStream({
      id: activityId,
      keys: [
        'time',
        'latlng',
        'distance',
        'altitude',
        'velocity_smooth',
        'heartrate',
        'cadence',
        'moving',
        'grade_smooth',
      ],
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    handleRateLimitExceeded();
    throw new Error('Error fetching activity');
  }

  const cleanedActivity = cleanupDetailedActivity(activity, userId, false);

  await upsertWithBackOff('activities', cleanedActivity);
  await upsertWithBackOff('streams', {
    ...stream,
    id: activityId,
    userId: userId,
  });
}

async function handleRateLimitExceeded() {
  const now = new Date();
  const next15 = new Date(
    Math.ceil(now.getTime() / QUARTER_HOUR) * QUARTER_HOUR,
  );
  let sleepTime = Math.round((next15.getTime() - now.getTime()) / SECOND);
  const sleepTimeOriginal = sleepTime;
  console.log(
    `Rate limit exceeded sleeping for ${sleepTime} seconds. Will resume at ${next15}`,
  );

  while (sleepTime > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(SLEEP_INTERVAL, sleepTime * SECOND)),
    );
    sleepTime -= SLEEP_INTERVAL / SECOND;
    if (sleepTime > 0) {
      console.log(`${sleepTime} seconds remaining`);
    }
  }

  throw new Error(
    `Rate limit exceeded waited for ${sleepTimeOriginal} before raising exception and requeueing the message`,
  );
}

export { enrichActivity };
