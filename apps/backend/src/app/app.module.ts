import { Module } from '@nestjs/common';

import {
  AdminController,
  StravaActivityGatheringController,
} from './app.controller';
import { StravaActivityGatheringService } from './src/StravaActivityGathering';
import { StravaDataEnhancementService } from './src/stravaDataEnhancement';

@Module({
  controllers: [StravaActivityGatheringController, AdminController],
  providers: [StravaActivityGatheringService, StravaDataEnhancementService],
})
export class AppModule {}
