import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { isRunningService } from '../../app/src/shared';

const serviceNames = ['StravaDataEnhancementService'];
@Injectable()
export class resetIsRunningStatusService {
  async endService(serviceName: string) {
    if (!serviceNames.includes(serviceName)) {
      throw new HttpException('Service name not found', HttpStatus.NOT_FOUND);
    }
    try {
      console.log('Resetting isRunningStatus of:', serviceName);
      const runningService = new isRunningService(serviceName);
      await runningService.getServiceStatus();
      await runningService.endService();
    } catch (error) {
      throw new HttpException(
        'Error ending service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
