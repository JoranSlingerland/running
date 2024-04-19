import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `\x1b[35m[New Request]\x1b[0m \x1b[36m[${new Date().toISOString()}]\x1b[0m \x1b[32m${req.method}\x1b[0m \x1b[33m${req.originalUrl}\x1b[0m`,
    );

    res.on('finish', () => {
      console.log(
        `\x1b[35m[Response Sent]\x1b[0m \x1b[36m[${new Date().toISOString()}]\x1b[0m \x1b[32m${req.method}\x1b[0m \x1b[33m${req.originalUrl}\x1b[0m \x1b[34m${res.statusCode}\x1b[0m`,
      );
    });

    next();
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
