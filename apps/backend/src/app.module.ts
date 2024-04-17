import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StravaActivityGatheringService } from './app/StravaActivityGathering';
import { StravaDataEnhancementService } from './app/stravaDataEnhancement';
import {
  StravaActivityGatheringController,
  StravaDataEnhancementController,
} from './app.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [
    StravaActivityGatheringController,
    StravaDataEnhancementController,
  ],
  providers: [StravaActivityGatheringService, StravaDataEnhancementService],
})
export class AppModule {}
