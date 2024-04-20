import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { RequestWithUser } from 'data';
import { AdminGuard } from 'src/guards/admin.guard';

import { resetIsRunningStatusService } from './src/resetIsRunningStatus';
import { StravaActivityGatheringService } from './src/StravaActivityGathering';
import { StravaDataEnhancementService } from './src/stravaDataEnhancement';

@Controller('strava/gather')
export class StravaActivityGatheringController {
  constructor(
    private readonly StravaActivityGatheringService: StravaActivityGatheringService,
    private readonly StravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Get()
  async gatherData(@Req() request: RequestWithUser) {
    const userId = request?.userId;
    console.log('userId', userId);
    const data = await this.StravaActivityGatheringService.orchestrator(userId);
    this.StravaDataEnhancementService.orchestrator();
    return data;
  }
}

@Controller('/admin/strava')
@UseGuards(AdminGuard)
export class StravaDataEnhancementController {
  constructor(
    private readonly StravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Get('/enhance')
  async gatherData() {
    return await this.StravaDataEnhancementService.orchestrator();
  }

  @Get('/reset')
  async resetIsRunningStatus(@Query('serviceName') serviceName: string) {
    const resetService = new resetIsRunningStatusService();
    await resetService.endService(serviceName);
    return {
      status: 'success',
      message: `Reset ${serviceName} running status`,
    };
  }
}
