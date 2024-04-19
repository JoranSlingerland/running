import { Controller, Get, Query } from '@nestjs/common';

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
  async gatherData(@Query('userId') userId: string) {
    const data = await this.StravaActivityGatheringService.orchestrator(userId);

    // Start the enhancement process
    this.StravaDataEnhancementService.orchestrator();

    // Return the data immediately
    return data;
  }
}

@Controller('/admin/strava')
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
