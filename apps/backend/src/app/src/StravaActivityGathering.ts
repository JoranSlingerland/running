import { cleanUpSummaryActivity } from '@lib/cleanup';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getLastActivityFromMongoDB,
  upsertActivitiesToMongoDB,
  upsertUserSettingsToMongoDB,
  userSettingsFromMongoDB,
} from '@repo/mongodb';
import { StravaClient, SummaryActivity } from '@repo/strava';
import { Activity, UserSettings } from '@repo/types';
import dayjs from 'dayjs';

import { StravaRateLimitService } from './shared';

@Injectable()
export class StravaActivityGatheringService {
  private rateLimitService = new StravaRateLimitService('Strava');
  private callsPerActivity = 1;

  async orchestrator(userId: string) {
    console.info('Step 0: Checking rate limits');
    const { callsAvailable, nextReset, limit } =
      await this.rateLimitService.checkStravaApiRateLimits(
        this.callsPerActivity,
      );
    if (!callsAvailable) {
      throw new HttpException(
        `API call limit reached. Try again after ${dayjs(nextReset).toISOString()}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    console.info('Step 1: Fetching user data');
    const userSettings = await this.getUserSettings(userId);

    console.info('Step 2: Fetching user activities');
    const activities = await this.getActivities(userSettings, limit);

    console.info('Step 3: Outputting data to MongoDB');
    await this.writeToMongoDB(activities);

    console.info(
      `Step 4: Returning data to the user with ${activities.length} activities added to the database`,
    );
    await this.rateLimitService.updateServiceStatus();
    return { status: 'success', activitiesAdded: activities.length };
  }

  private async getUserSettings(_id: string): Promise<UserSettings> {
    const userSettings = await userSettingsFromMongoDB(_id);
    if (!userSettings) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return userSettings;
  }

  async getActivities(userSettings: UserSettings, limit: number) {
    const maxApiCalls = Math.floor(limit / this.callsPerActivity);
    let apiCalls = 0;
    const results: SummaryActivity[] = [];
    let response: SummaryActivity[] | undefined = undefined;

    const stravaClient = new StravaClient(userSettings.strava_authentication);
    const auth = await stravaClient.initialize();

    upsertUserSettingsToMongoDB({
      ...userSettings,
      strava_authentication: auth,
    });

    // eslint-disable-next-line prefer-const
    let { epochStartDate, page } = await this.getActivitiesQuery(userSettings);

    while (apiCalls < maxApiCalls) {
      try {
        apiCalls++;
        response = await stravaClient.getActivities({
          after: epochStartDate,
          page,
        });
      } catch (error) {
        this.handleNotAllPagesSynced(userSettings, page);
        break;
      }

      if (!response || response.length === 0) {
        this.handleAllPagesSynced(userSettings);
        break;
      }

      results.push(...response);

      page++;
    }

    if (apiCalls >= maxApiCalls) {
      this.handleNotAllPagesSynced(userSettings, page);
    }

    this.rateLimitService.updateApiCallCount(apiCalls);

    if (!results || results.length === 0) {
      return [];
    }

    return results.map((activity) =>
      cleanUpSummaryActivity(activity, userSettings._id),
    );
  }

  private async getActivitiesQuery(userSettings: UserSettings) {
    let page = 1;
    let epochStartDate = 0;

    if (
      userSettings.activity_pages_synced === 'all' ||
      !userSettings.activity_pages_synced
    ) {
      const latestActivityDate = await getLastActivityFromMongoDB(
        userSettings._id,
      );
      if (latestActivityDate?.start_date) {
        epochStartDate =
          new Date(latestActivityDate.start_date).getTime() / 1000;
      }
    }

    if (typeof userSettings.activity_pages_synced === 'number') {
      page = userSettings.activity_pages_synced + 1;
    }

    return { page, epochStartDate };
  }

  private async handleNotAllPagesSynced(
    userSettings: UserSettings,
    page: number,
  ) {
    if (
      !userSettings.activity_pages_synced ||
      typeof userSettings.activity_pages_synced === 'number'
    ) {
      upsertUserSettingsToMongoDB({
        ...userSettings,
        activity_pages_synced: Math.max(page - 1, 0),
      });
    }
  }

  private async handleAllPagesSynced(userSettings: UserSettings) {
    if (
      !userSettings.activity_pages_synced ||
      typeof userSettings.activity_pages_synced === 'number'
    ) {
      upsertUserSettingsToMongoDB({
        ...userSettings,
        activity_pages_synced: 'all',
      });
    }
  }

  async writeToMongoDB(activities: Activity[]) {
    upsertActivitiesToMongoDB(activities);
  }
}
