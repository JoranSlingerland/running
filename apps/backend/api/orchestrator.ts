import {
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
} from '@azure/functions';
import * as df from 'durable-functions';
import { decryptJwt } from '@repo/jwt';

export const orchestratorStart: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const functionName = request.query.get('functionName');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const jwt = decryptJwt(token, { secret: process.env.API_SHARED_KEY });

  if (!jwt || !jwt.id) {
    return new HttpResponse({
      status: 401,
      jsonBody: {
        message: 'Unauthorized',
      },
    });
  }

  const allowedFunctionNames = ['gatherData'];
  if (!functionName || !allowedFunctionNames.includes(functionName)) {
    return new HttpResponse({
      status: 400,
      jsonBody: {
        message:
          'Please pass a valid functionName on the query string or in the request body',
      },
    });
  }

  const instanceId: string = await client.startNew(functionName);

  context.log(
    `Started orchestration ${functionName} with ID = '${instanceId}'.`,
  );

  return client.createCheckStatusResponse(request, instanceId);
};
