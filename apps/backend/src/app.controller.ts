import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { StravaActivityGatheringService } from './app/StravaActivityGathering';
import { StravaDataEnhancementService } from './app/stravaDataEnhancement';

@Controller('strava/gather')
export class StravaActivityGatheringController {
  constructor(
    private readonly StravaActivityGatheringService: StravaActivityGatheringService,
    private readonly StravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Get()
  async gatherData(@Query('userId') userId: string) {
    try {
      const data =
        await this.StravaActivityGatheringService.orchestrator(userId);

      // Start the enhancement process
      this.StravaDataEnhancementService.orchestrator();

      // Return the data immediately
      return data;
    } catch (error) {
      console.error('Error gathering data:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to enhance data',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}

@Controller('/admin/strava/enhance')
export class StravaDataEnhancementController {
  constructor(
    private readonly StravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Get()
  async gatherData() {
    try {
      return await this.StravaDataEnhancementService.orchestrator();
    } catch (error) {
      console.error('Error enhancing data:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to enhance data',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
