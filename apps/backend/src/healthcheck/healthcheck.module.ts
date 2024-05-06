import { Module } from '@nestjs/common';

import { healthCheckController } from './healthcheck.controller';

@Module({
  controllers: [healthCheckController],
})
export class HealthCheckModule {}
