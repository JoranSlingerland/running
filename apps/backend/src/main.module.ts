import { AppModule } from '@app/app.module';
import { HealthCheckModule } from '@healthcheck/healthcheck.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from '@tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TasksModule,
    AppModule,
    HealthCheckModule,
  ],
})
export class MainModule {}
