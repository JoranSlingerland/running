import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StravaDataEnhancementService } from 'src/app/src/stravaDataEnhancement';

@Injectable()
export class StravaDataEnhancementCronService {
  constructor(
    private readonly stravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'stravaDataEnhancement',
  })
  async handleCron() {
    if (process.env.NODE_ENV !== 'production') {
      console.info('Not in production environment, skipping cron job');
      return;
    }

    console.info('Running cron job');
    await this.stravaDataEnhancementService.orchestrator();
  }
}
