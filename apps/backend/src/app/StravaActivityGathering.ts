import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getLastActivityFromMongoDB,
  upsertActivitiesToMongoDB,
  upsertUserSettingsToMongoDB,
  userSettingsFromMongoDB,
} from '@repo/mongodb';
import { StravaClient } from '@repo/strava';
import { Activity, UserSettings } from '@repo/types';

import { StravaRateLimitService } from './shared';
import { cleanUpSummaryActivity } from '../lib/cleanup';

@Injectable()
export class StravaActivityGatheringService {
  private rateLimitService = new StravaRateLimitService('Strava');
  private callsPerActivity = 1;

  async orchestrator(userId: string) {
    console.info('Step 0: Checking rate limits');
    const { callsAvailable } =
      await this.rateLimitService.checkStravaApiRateLimits(
        this.callsPerActivity,
      );
    if (!callsAvailable) {
      throw new HttpException(
        'API call limit reached',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    console.info('Step 1: Fetching user data');
    const userSettings = await this.getUserSettings(userId);

    console.info('Step 2: Fetching user activities');
    const activities = await this.getActivities(userSettings);

    console.info('Step 3: Outputting data to MongoDB');
    await this.writeToMongoDB(activities);

    console.info(
      `Step 4: Returning data to the user with ${activities.length} activities added to the database`,
    );
    this.rateLimitService.updateServiceStatus();
    return { status: 'success', activitiesAdded: activities.length };
  }

  private async getUserSettings(_id: string): Promise<UserSettings> {
    const userSettings = await userSettingsFromMongoDB(_id);
    if (!userSettings) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return userSettings;
  }

  async getActivities(userSettings: UserSettings) {
    const latestActivityDate = await getLastActivityFromMongoDB(
      userSettings._id,
    );

    const stravaClient = new StravaClient(userSettings.strava_authentication);
    const auth = await stravaClient.initialize();

    upsertUserSettingsToMongoDB({
      ...userSettings,
      strava_authentication: auth,
    });

    let epochStartDate = 0;
    if (latestActivityDate?.start_date) {
      epochStartDate = new Date(latestActivityDate.start_date).getTime() / 1000;
    }

    // There could be more then 1 api call per activity.
    // This is not being accounted for in the rate limit check.
    this.rateLimitService.updateApiCallCount();
    const activities = await stravaClient.getActivities({
      after: epochStartDate,
    });

    if (!activities || activities.length === 0) {
      return [];
    }

    return activities.map((activity) =>
      cleanUpSummaryActivity(activity, userSettings._id),
    );
  }

  async writeToMongoDB(activities: Activity[]) {
    upsertActivitiesToMongoDB(activities);
  }
}
