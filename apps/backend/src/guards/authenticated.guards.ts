import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { backendEnvFunction } from '@repo/env/src/env';
import { decryptAndVerifyPayload } from '@repo/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const env = backendEnvFunction();
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const jwt = await decryptAndVerifyPayload(token, {
      secret: env.API_SHARED_KEY,
    });

    if (!jwt || !jwt.id || typeof jwt.id !== 'string') {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    request.userId = jwt.id;
    request.admin = jwt.admin;

    return true;
  }
}
