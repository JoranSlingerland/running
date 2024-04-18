import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StravaDataEnhancementService } from 'src/app/stravaDataEnhancement';

@Injectable()
export class StravaDataEnhancementCronService {
  constructor(
    private readonly stravaDataEnhancementService: StravaDataEnhancementService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'stravaDataEnhancement',
  })
  async handleCron() {
    console.info('Running cron job');
    await this.stravaDataEnhancementService.orchestrator();
  }
}
