import { NestFactory } from '@nestjs/core';

import { AllExceptionsFilter, LoggerMiddleware } from './app.middleware';
import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(new LoggerMiddleware().use);
  await app.listen(3001);
}
bootstrap();
