import { HttpException, HttpStatus } from '@nestjs/common';
import { backendEnv as env } from '@repo/env';
import {
  getLatestSchemaVersion,
  serviceStatusFromMongoDB,
  upsertServiceStatusToMongoDB,
} from '@repo/mongodb';
import { IsRunningStatus, RateLimitStatus } from '@repo/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export class StravaRateLimitService {
  private serviceStatus: RateLimitStatus | undefined;
  private serviceName: string;
  private apiCallCount: number;

  constructor(serviceName: string) {
    this.serviceName = `${serviceName}-rateLimitService`;
    this.resetClass();
    this.apiCallCount = 0;
  }

  public async getServiceStatus() {
    this.serviceStatus = await serviceStatusFromMongoDB<RateLimitStatus>(
      this.serviceName,
    );
    if (!this.serviceStatus) {
      this.serviceStatus = {
        _id: this.serviceName,
        apiCallCount15Min: 0,
        apiCallCountDaily: 0,
        apiCallLimit15Min: env.STRAVA_15MIN_LIMIT,
        apiCallLimitDaily: env.STRAVA_DAILY_LIMIT,
        lastReset15Min: dayjs().toISOString(),
        lastResetDaily: dayjs().toISOString(),
        version: getLatestSchemaVersion('serviceStatus'),
      };
      await upsertServiceStatusToMongoDB(this.serviceStatus);
    }
    this.serviceStatus.apiCallLimit15Min = env.STRAVA_15MIN_LIMIT;
    this.serviceStatus.apiCallLimitDaily = env.STRAVA_DAILY_LIMIT;

    return this.serviceStatus;
  }

  public resetClass() {
    this.apiCallCount = 0;
  }

  public async checkStravaApiRateLimits(callsPerActivity: number) {
    await this.getServiceStatus();

    if (!this.serviceStatus) {
      throw new HttpException(
        'Service status not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const fifteenMinuteLimit = env.STRAVA_15MIN_LIMIT;
    const dailyLimit = env.STRAVA_DAILY_LIMIT;

    const current = dayjs();
    const nextReset15Min = dayjs(this.serviceStatus.lastReset15Min)
      .startOf('hour')
      .add(
        Math.ceil(dayjs(this.serviceStatus.lastReset15Min).minute() / 15) * 15,
        'minute',
      );
    const nextResetDaily = dayjs(this.serviceStatus.lastResetDaily)
      .startOf('day')
      .add(1, 'day');

    if (current.isAfter(nextReset15Min)) {
      this.serviceStatus.apiCallCount15Min = 0;
      this.serviceStatus.lastReset15Min = current.toISOString();
      await upsertServiceStatusToMongoDB(this.serviceStatus);
    }

    if (current.isAfter(nextResetDaily)) {
      this.serviceStatus.apiCallCountDaily = 0;
      this.serviceStatus.lastResetDaily = current.toISOString();
      await upsertServiceStatusToMongoDB(this.serviceStatus);
    }

    const nextCallReset = () => {
      if (!this.serviceStatus) {
        throw new HttpException(
          'Service status not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (this.serviceStatus.apiCallCount15Min >= fifteenMinuteLimit) {
        return nextReset15Min;
      } else if (this.serviceStatus.apiCallCountDaily >= dailyLimit) {
        return nextResetDaily;
      }
      return nextReset15Min;
    };

    const limitInfo = {
      callsAvailable: true,
      limit: Math.min(
        fifteenMinuteLimit - this.serviceStatus.apiCallCount15Min,
        dailyLimit - this.serviceStatus.apiCallCountDaily,
      ),
      nextReset: nextCallReset().toISOString(),
    };

    if (limitInfo.limit - callsPerActivity < 0) {
      console.error('API call limit reached');
      limitInfo.callsAvailable = false;
    }

    return limitInfo;
  }

  public updateApiCallCount(calls = 1) {
    this.apiCallCount += calls;
  }

  public async updateServiceStatus() {
    await this.getServiceStatus();

    if (!this.serviceStatus) {
      throw new HttpException(
        'Service status not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.serviceStatus.apiCallCount15Min += this.apiCallCount;
    this.serviceStatus.apiCallCountDaily += this.apiCallCount;
    await upsertServiceStatusToMongoDB(this.serviceStatus);
    this.resetClass();
  }
}

export class isRunningService {
  private runningStatus: IsRunningStatus | undefined;
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = `${serviceName}-isRunningService`;
    this.getServiceStatus();
  }

  public async getServiceStatus() {
    this.runningStatus = await serviceStatusFromMongoDB<IsRunningStatus>(
      this.serviceName,
    );
    if (!this.runningStatus) {
      this.runningStatus = {
        _id: this.serviceName,
        isRunning: false,
        lastUpdated: dayjs().toISOString(),
        version: getLatestSchemaVersion('serviceStatus'),
      };
      await upsertServiceStatusToMongoDB(this.runningStatus);
    }
    return this.runningStatus;
  }

  public async startService() {
    this.getServiceStatus();
    if (this.runningStatus?.isRunning) {
      return true;
    }

    if (!this.runningStatus) {
      throw new HttpException(
        'Running status not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.runningStatus.isRunning = true;
    await upsertServiceStatusToMongoDB(this.runningStatus);
    return false;
  }

  public async endService() {
    if (!this.runningStatus) {
      throw new HttpException(
        'Running status not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.runningStatus.isRunning = false;
    await upsertServiceStatusToMongoDB(this.runningStatus);
  }
}
