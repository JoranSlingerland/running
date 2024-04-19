import { Module } from '@nestjs/common';

import {
  StravaActivityGatheringController,
  StravaDataEnhancementController,
} from './app.controller';
import { StravaActivityGatheringService } from './src/StravaActivityGathering';
import { StravaDataEnhancementService } from './src/stravaDataEnhancement';

@Module({
  controllers: [
    StravaActivityGatheringController,
    StravaDataEnhancementController,
  ],
  providers: [StravaActivityGatheringService, StravaDataEnhancementService],
})
export class AppModule {}
