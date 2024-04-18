import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { StravaActivityGatheringService } from './app/StravaActivityGathering';
import { StravaDataEnhancementService } from './app/stravaDataEnhancement';
import {
  StravaActivityGatheringController,
  StravaDataEnhancementController,
} from './app.controller';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), TasksModule],
  controllers: [
    StravaActivityGatheringController,
    StravaDataEnhancementController,
  ],
  providers: [StravaActivityGatheringService, StravaDataEnhancementService],
})
export class AppModule {}
