import { Injectable } from '@nestjs/common';
import {
  getNonFullDataActivitiesFromMongoDB,
  serviceStatusFromMongoDB,
  upsertActivitiesToMongoDB,
  upsertServiceStatusToMongoDB,
  upsertStreamsToMongoDB,
  upsertUserSettingsToMongoDB,
  userSettingsFromMongoDB,
} from '@repo/mongodb';
import {
  DetailedActivity,
  StravaClient,
  Streams as stravaStreams,
} from '@repo/strava';
import { Activity, Streams, UserSettings } from '@repo/types';
import dayjs from 'dayjs';
import { bisectLeft } from 'src/lib/helpers';

import { cleanupDetailedActivity } from '../lib/cleanup';
import {
  calculateHrMaxPercentage,
  calculateHrReserve,
  calculateHrTrimp,
  calculatePaceReserve,
  calculatePaceTrimp,
  calculateVo2MaxEstimate,
} from '../lib/trimpHelpers';

type ServiceStatus = {
  _id: string;
  apiCallCount15Min: number;
  apiCallCountDaily: number;
  lastReset15Min: string;
  lastResetDaily: string;
  isRunning: boolean;
};

@Injectable()
export class StravaDataEnhancementService {
  private serviceStatus: ServiceStatus;

  async orchestrator() {
    this.serviceStatus = await this.getServiceStatus();
    if (this.serviceStatus.isRunning) {
      console.info(`Strava data enhancement is already running`);
      return;
    }
    this.serviceStatus.isRunning = true;
    await upsertServiceStatusToMongoDB(this.serviceStatus);

    const callsPerActivity = 2;

    console.info('Step 1: Checking rate limits');
    const { callsAvailable, limit } =
      await this.checkStravaApiRateLimits(callsPerActivity);
    if (!callsAvailable) {
      this.serviceStatus.isRunning = false;
      await upsertServiceStatusToMongoDB(this.serviceStatus);
      return { status: 'error', message: 'API call limit reached' };
    }

    console.info('Step 2: Fetching activities without full data');
    const activities = (await this.getActivities()).slice(
      0,
      Math.floor(limit / callsPerActivity),
    );

    console.info(
      'Step 3: Fetching activity and stream. Then writing to MongoDB',
    );
    const promises = activities.map(async (activity) => {
      const { activity: cleanedActivity, stream } =
        (await this.getActivityAndStream(activity)) || {};

      if (!cleanedActivity || !stream) {
        return {
          status: 'error',
          message: 'Error fetching activity or stream',
          activityId: activity._id,
        };
      }

      const calculatedActivity = await this.calculateCustomFields(
        cleanedActivity,
        stream,
      );

      await this.writeToMongoDB([calculatedActivity], [stream]);
      return { status: 'success', activityId: activity._id };
    });

    const result = await Promise.all(promises);
    console.info(
      `Step 4: Returning data to the user with ${result.length} activities enhanced`,
    );
    this.serviceStatus.isRunning = false;
    await upsertServiceStatusToMongoDB(this.serviceStatus);
    return {
      status: 'success',
      activitiesEnhanced: result.filter(Boolean).length,
      details: result,
    };
  }

  private async checkStravaApiRateLimits(callsPerActivity: number) {
    const fifteenMinuteLimit = parseInt(process.env.STRAVA_15MIN_LIMIT) || 100;
    const dailyLimit = parseInt(process.env.STRAVA_DAILY_LIMIT) || 1000;

    if (dayjs().diff(this.serviceStatus.lastReset15Min, 'minute') >= 15) {
      this.serviceStatus.apiCallCount15Min = 0;
      this.serviceStatus.lastReset15Min = dayjs().toISOString();
      await upsertServiceStatusToMongoDB(this.serviceStatus);
    }

    if (dayjs().diff(this.serviceStatus.lastResetDaily, 'day') >= 1) {
      this.serviceStatus.apiCallCountDaily = 0;
      this.serviceStatus.lastResetDaily = dayjs().toISOString();
      await upsertServiceStatusToMongoDB(this.serviceStatus);
    }

    const limitInfo = {
      callsAvailable: true,
      limit: Math.min(
        fifteenMinuteLimit - this.serviceStatus.apiCallCount15Min,
        dailyLimit - this.serviceStatus.apiCallCountDaily,
      ),
    };

    if (limitInfo.limit - callsPerActivity < 0) {
      console.error('API call limit reached');
      limitInfo.callsAvailable = false;
    }

    return limitInfo;
  }

  private updateApiCallCount() {
    this.serviceStatus.apiCallCount15Min += 1;
    this.serviceStatus.apiCallCountDaily += 1;
  }

  private async getServiceStatus(): Promise<ServiceStatus> {
    const serviceStatus = await serviceStatusFromMongoDB<ServiceStatus>(
      'stravaDataEnhancement',
    );
    if (!serviceStatus) {
      const serviceStatus: ServiceStatus = {
        _id: 'stravaDataEnhancement',
        apiCallCount15Min: 1000,
        apiCallCountDaily: 1000,
        lastReset15Min: dayjs().toISOString(),
        lastResetDaily: dayjs().toISOString(),
        isRunning: false,
      };
      await upsertServiceStatusToMongoDB(serviceStatus);
      return serviceStatus;
    }
    return serviceStatus;
  }

  private async getUserSettings(_id: string): Promise<UserSettings> {
    const userSettings = await userSettingsFromMongoDB(_id);
    if (!userSettings) {
      throw new Error('User not found');
    }
    return userSettings;
  }

  private async getActivities() {
    return await getNonFullDataActivitiesFromMongoDB();
  }

  private async getActivityAndStream(activity: Activity) {
    let detailedActivity: DetailedActivity;
    let stravaStream: stravaStreams;

    const userSettings = await this.getUserSettings(activity.userId);

    const stravaClient = new StravaClient(userSettings.strava_authentication);
    const auth = await stravaClient.initialize();
    upsertUserSettingsToMongoDB({
      ...userSettings,
      strava_authentication: auth,
    });

    try {
      this.updateApiCallCount();
      detailedActivity = await stravaClient.getActivity({ id: activity._id });
    } catch (error) {
      console.error('Error fetching activity:', error);
      return;
    }

    try {
      stravaStream = await stravaClient.getStream({
        id: activity._id,
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
      console.error('Error fetching stream:', error);
      return;
    }

    const stream: Streams = {
      ...stravaStream,
      _id: activity._id,
      userId: activity.userId,
    };

    const cleanedActivity = cleanupDetailedActivity(
      detailedActivity,
      userSettings._id,
    );

    return { activity: cleanedActivity, stream };
  }

  private async calculateCustomFields(
    activity: Activity,
    stream: Streams,
  ): Promise<Activity> {
    const userSettings = await this.getUserSettings(activity.userId);

    if (activity.has_heartrate) {
      activity.laps = this.calculateLapsHrData(
        activity.laps,
        stream,
        userSettings,
      );

      activity.hr_reserve = calculateHrReserve(
        activity.average_heartrate,
        userSettings.heart_rate.resting,
        userSettings.heart_rate.max,
      );

      if (userSettings.gender) {
        activity.hr_trimp = calculateHrTrimp(
          activity.moving_time,
          activity.hr_reserve,
          userSettings.gender,
          true,
        );
      }

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

    if (activity.type.toLowerCase() === 'run') {
      activity.laps = this.calculateLapsPaceData(activity.laps, userSettings);

      const paceReserve = calculatePaceReserve(
        activity.average_speed,
        userSettings.pace.threshold,
      );

      activity.pace_reserve = paceReserve;
      if (userSettings.gender) {
        activity.pace_trimp = calculatePaceTrimp(
          activity.moving_time,
          paceReserve,
          userSettings.gender,
          true,
        );
      }
    }

    activity.full_data = true;

    return activity;
  }

  private calculateLapsHrData(
    laps: Activity['laps'] | null | undefined,
    stream: Streams,
    userSettings: UserSettings,
  ): Activity['laps'] | null {
    if (!laps) {
      return null;
    }
    let totalTime = 0;

    for (let i = 0; i < laps.length; i++) {
      const lap = laps[i];
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
      const heartRateReserve = calculateHrReserve(
        averageHeartRate,
        userSettings.heart_rate.resting,
        userSettings.heart_rate.max,
      );

      laps[i].average_heartrate = averageHeartRate;
      laps[i].hr_reserve = heartRateReserve;

      if (userSettings.gender) {
        laps[i].hr_trimp = calculateHrTrimp(
          lap.moving_time,
          heartRateReserve,
          userSettings.gender,
          true,
        );
      }
    }
    return laps;
  }

  private calculateLapsPaceData(
    laps: Activity['laps'] | null,
    userSettings: UserSettings,
  ): Activity['laps'] | null {
    if (!laps) {
      return null;
    }
    for (let i = 0; i < laps.length; i++) {
      const lap = laps[i];

      const paceReserve = calculatePaceReserve(
        lap.average_speed,
        userSettings.pace.threshold,
      );

      laps[i].pace_reserve = paceReserve;

      if (userSettings.gender) {
        laps[i].pace_trimp = calculatePaceTrimp(
          lap.moving_time,
          paceReserve,
          userSettings.gender,
          true,
        );
      }
    }
    return laps;
  }

  private async writeToMongoDB(activities: Activity[], streams: Streams[]) {
    upsertActivitiesToMongoDB(activities);
    upsertStreamsToMongoDB(streams);
  }
}
