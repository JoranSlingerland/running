import {
  upsertUserSettingsToCosmos,
  upsertWithBackOff,
  userSettingsFromCosmos,
} from '@repo/cosmosdb';
import { DetailedActivity, StravaClient, Streams } from '@repo/strava';
import { Activity, UserSettings } from '@repo/types';

import { cleanupDetailedActivity } from '../lib/cleanup';
import {
  calculateHrMaxPercentage,
  calculateHrReserve,
  calculateHrTrimp,
  calculatePaceReserve,
  calculatePaceTrimp,
  calculateVo2MaxEstimate,
} from '../lib/trimpHelpers';

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

  const { activity, stream } = await getActivityAndStream(
    activityId,
    userSettings,
  );

  const calculatedActivity = calculateCustomFields(
    activity,
    stream,
    userSettings,
  );

  calculatedActivity.id.toString();

  await upsertWithBackOff('activities', calculatedActivity);
  await upsertWithBackOff('streams', {
    ...stream,
    id: activityId.toString(),
    userId: userId,
  });
}

async function getActivityAndStream(
  activityId: number,
  userSettings: UserSettings,
) {
  let activity: DetailedActivity;
  let stream: Streams;

  const stravaClient = new StravaClient(userSettings.strava_authentication);
  const auth = await stravaClient.initialize();
  upsertUserSettingsToCosmos({
    ...userSettings,
    strava_authentication: auth,
  });

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

  const cleanedActivity = cleanupDetailedActivity(
    activity,
    userSettings.id,
    false,
  );

  return { activity: cleanedActivity, stream };
}

function calculateCustomFields(
  activity: Activity,
  stream: Streams,
  userSettings: UserSettings,
): Activity {
  // Calculate Reserves

  if (activity.has_heartrate) {
    let totalTime = 0;

    if (activity.laps) {
      for (let i = 0; i < activity.laps.length; i++) {
        const lap = activity.laps[i];
        const startTime = totalTime;
        const elapsed_time = lap.elapsed_time;
        totalTime += elapsed_time;

        lap.start_index = bisectLeft(stream.time.data, startTime);
        lap.end_index = bisectLeft(stream.time.data, totalTime);

        const heartRateData = stream.heartrate.data.slice(
          lap.start_index,
          lap.end_index,
        );

        const averageHeartRate = Math.round(
          heartRateData.reduce((a, b) => a + b, 0) / heartRateData.length,
        );

        activity.laps[i].average_heartrate = averageHeartRate;
        activity.laps[i].hr_reserve = calculateHrReserve(
          averageHeartRate,
          userSettings.heart_rate.resting,
          userSettings.heart_rate.max,
        );
      }
    }

    activity.hr_reserve = calculateHrReserve(
      activity.average_heartrate,
      userSettings.heart_rate.resting,
      userSettings.heart_rate.max,
    );
  }

  if (activity.type.toLowerCase() === 'run') {
    if (activity.laps) {
      for (let i = 0; i < activity.laps.length; i++) {
        const lap = activity.laps[i];
        activity.laps[i].pace_reserve = calculatePaceReserve(
          lap.average_speed,
          userSettings.pace.threshold,
        );
      }
    }

    activity.pace_reserve = calculatePaceReserve(
      activity.average_speed,
      userSettings.pace.threshold,
    );
  }

  // Calculate TRIMP
  if (activity.has_heartrate && userSettings.gender) {
    if (activity.laps) {
      for (let i = 0; i < activity.laps.length; i++) {
        const lap = activity.laps[i];
        if (!lap.hr_reserve) {
          console.warn('Skipping lap because of missing hr_reserve');
          continue;
        }
        activity.laps[i].hr_trimp = calculateHrTrimp(
          lap.moving_time,
          lap.hr_reserve,
          userSettings.gender,
          true,
        );
      }
    }

    if (activity.hr_reserve) {
      activity.hr_trimp = calculateHrTrimp(
        activity.moving_time,
        activity.hr_reserve,
        userSettings.gender,
        true,
      );
    }
  }

  if (activity.type.toLowerCase() === 'run' && userSettings.gender) {
    if (activity.laps) {
      for (let i = 0; i < activity.laps.length; i++) {
        const lap = activity.laps[i];
        if (!lap.pace_reserve) {
          console.warn('Skipping lap because of missing pace_reserve');
          continue;
        }
        activity.laps[i].pace_trimp = calculatePaceTrimp(
          lap.moving_time,
          lap.pace_reserve,
          userSettings.gender,
          true,
        );
      }
    }

    if (activity.pace_reserve) {
      activity.pace_trimp = calculatePaceTrimp(
        activity.moving_time,
        activity.pace_reserve,
        userSettings.gender,
        true,
      );
    }
  }

  // Calculate Vo2Max

  if (activity.has_heartrate) {
    activity.hr_max_percentage = calculateHrMaxPercentage(
      activity.average_heartrate,
      userSettings.heart_rate.max,
    );
    const vo2max = calculateVo2MaxEstimate(
      activity.distance,
      activity.moving_time,
      activity.hr_max_percentage,
      true,
    );
    activity.vo2max_estimate = {
      workout_vo2_max: vo2max.workoutVo2Max,
      vo2_max_percentage: vo2max.vo2MaxPercentage,
      estimated_vo2_max: vo2max.estimatedVo2Max,
    };
  }

  activity.custom_fields_calculated = true;

  return activity;
}

function bisectLeft(arr: number[], value: number, lo = 0, hi = arr.length) {
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < value) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
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
