import { AdminGuard } from '@guards/admin.guard';
import { JwtAuthGuard } from '@guards/authenticated.guards';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from 'data';

import { StravaRateLimitService, isRunningService } from './src/shared';
import { StravaActivityGatheringService } from './src/StravaActivityGathering';
import { StravaDataEnhancementService } from './src/stravaDataEnhancement';

@Controller('strava/gather')
@UseGuards(JwtAuthGuard)
export class StravaActivityGatheringController {
  constructor(
    private readonly StravaActivityGatheringService: StravaActivityGatheringService,
    private readonly StravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Get()
  async gatherData(@Req() request: RequestWithUser) {
    const userId = request?.userId;
    const data = await this.StravaActivityGatheringService.orchestrator(userId);
    this.StravaDataEnhancementService.orchestrator(userId);
    return data;
  }
}

@Controller('/admin')
@UseGuards(AdminGuard)
export class AdminController {
  private serviceNames = ['StravaDataEnhancementService'];
  constructor(
    private readonly StravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Get('strava/enhance')
  async gatherData() {
    return await this.StravaDataEnhancementService.orchestrator();
  }

  @Get('/strava/rateLimit')
  async getRateLimit() {
    const rateLimitService = new StravaRateLimitService('Strava');
    return await rateLimitService.getServiceStatus();
  }

  @Get('/serviceStatus/reset')
  async resetIsRunningStatus(@Query('serviceName') serviceName: string) {
    if (!this.serviceNames.includes(serviceName)) {
      throw new HttpException('Service name not found', HttpStatus.NOT_FOUND);
    }
    try {
      const runningService = new isRunningService(serviceName);
      await runningService.getServiceStatus();
      await runningService.endService();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      status: 'success',
    };
  }

  @Get('/serviceStatus')
  async getServiceStatus(@Query('serviceName') serviceName: string) {
    if (!this.serviceNames.includes(serviceName)) {
      throw new HttpException('Service name not found', HttpStatus.NOT_FOUND);
    }
    const resetService = new isRunningService(serviceName);
    return await resetService.getServiceStatus();
  }
}
