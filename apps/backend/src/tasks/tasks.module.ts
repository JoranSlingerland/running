import { Module } from '@nestjs/common';
import { StravaDataEnhancementService } from 'src/app/src/stravaDataEnhancement';

import { StravaDataEnhancementCronService } from './tasks.service';

@Module({
  providers: [StravaDataEnhancementCronService, StravaDataEnhancementService],
})
export class TasksModule {}
