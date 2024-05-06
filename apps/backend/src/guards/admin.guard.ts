import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { JwtAuthGuard } from './authenticated.guards';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();

    if (!request.admin) {
      throw new HttpException(
        'You do not have permission to perform this action',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
