import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { backendEnv as env } from '@repo/env';
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
    if (env.NODE_ENV !== 'production') {
      console.info('Not in production environment, skipping cron job');
      return;
    }

    console.info('Running stravaDataEnhancement triggered by cron job');
    await this.stravaDataEnhancementService.orchestrator();
  }
}
