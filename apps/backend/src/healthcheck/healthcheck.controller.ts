import { Controller, Get } from '@nestjs/common';

@Controller('/healthcheck')
export class healthCheckController {
  @Get()
  async gatherData() {
    return {
      status: 'ok',
    };
  }
}
