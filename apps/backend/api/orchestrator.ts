import {
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
} from '@azure/functions';
import * as df from 'durable-functions';

import { getAuthorization } from '../lib/authorization';

export const orchestratorStart: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const functionName = request.query.get('functionName');
  const { authorized, userId } = getAuthorization(request);

  if (!authorized) {
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

  const instanceId: string = await client.startNew(functionName, {
    input: { id: userId },
  });

  context.log(
    `Started orchestration ${functionName} with ID = '${instanceId}'.`,
  );

  return client.createCheckStatusResponse(request, instanceId);
};

export const orchestratorTerminate: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const instanceId = request.query.get('instanceId');
  const { authorized, userId } = getAuthorization(request);

  if (!authorized) {
    return new HttpResponse({
      status: 401,
      jsonBody: {
        message: 'Unauthorized',
      },
    });
  }

  if (!instanceId) {
    return new HttpResponse({
      status: 400,
      jsonBody: {
        message: 'Please pass an instanceId on the query string',
      },
    });
  }

  const status = await client.getStatus(instanceId);
  const input = status.input || {
    id: null,
  };

  if (typeof input === 'object' && 'id' in input && input.id !== userId) {
    return new HttpResponse({
      status: 401,
      jsonBody: {
        message: 'Unauthorized',
      },
    });
  }

  if (
    status.runtimeStatus.toLowerCase() in ['completed', 'failed', 'terminated']
  ) {
    return new HttpResponse({
      status: 200,
      jsonBody: {
        message: `Orchestration ${instanceId} is already in a final state.`,
      },
    });
  }

  try {
    await client.terminate(instanceId, 'Terminated by the API');
    return new HttpResponse({
      status: 200,
      jsonBody: {
        message: `Orchestration ${instanceId} was terminated.`,
      },
    });
  } catch (error) {
    return new HttpResponse({
      status: 500,
      jsonBody: {
        message: `Failed to terminate orchestration ${instanceId}: ${error}`,
      },
    });
  }
};

export const orchestratorPurge: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const instanceId = request.query.get('instanceId');
  const { authorized, userId } = getAuthorization(request);

  if (!authorized) {
    return new HttpResponse({
      status: 401,
      jsonBody: {
        message: 'Unauthorized',
      },
    });
  }

  if (!instanceId) {
    return new HttpResponse({
      status: 400,
      jsonBody: {
        message: 'Please pass an instanceId on the query string',
      },
    });
  }

  const status = await client.getStatus(instanceId);
  const input = status.input || {
    id: null,
  };
  // Check if input is an object with an id property
  if (typeof input === 'object' && 'id' in input && input.id !== userId) {
    return new HttpResponse({
      status: 401,
      jsonBody: {
        message: 'Unauthorized',
      },
    });
  }

  try {
    await client.purgeInstanceHistory(instanceId);
    return new HttpResponse({
      status: 200,
      jsonBody: {
        message: `Orchestration ${instanceId} was purged.`,
      },
    });
  } catch (error) {
    return new HttpResponse({
      status: 500,
      jsonBody: {
        message: `Failed to purge orchestration ${instanceId}: ${error}`,
      },
    });
  }
};

export const orchestratorList: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  let days = request.query.get('days');
  const { authorized, userId } = getAuthorization(request);

  if (!authorized) {
    return new HttpResponse({
      status: 401,
      jsonBody: {
        message: 'Unauthorized',
      },
    });
  }

  if (!days) {
    days = '7';
  }

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - parseInt(days));

  const orchestrations = await getOrchestrations(
    startDate,
    endDate,
    client,
    userId,
  );
  // Sort orchestrations by createdTime
  orchestrations.sort((a, b) => {
    return (
      new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    );
  });

  return new HttpResponse({
    status: 200,
    jsonBody: orchestrations,
  });
};

async function getOrchestrations(
  startDate: Date,
  endDate: Date,
  client: df.DurableClient,
  userId: string | null,
) {
  const instances = await client.getStatusBy({
    createdTimeFrom: startDate,
    createdTimeTo: endDate,
  });

  const output = [];
  for (const instance of instances) {
    const input = instance.input || {
      id: null,
    };

    if (
      instance.name === 'gatherData' &&
      typeof input === 'object' &&
      'id' in input &&
      input.id === userId
    ) {
      const outputObject = {
        instanceId: instance.instanceId,
        name: instance.name,
        createdTime: instance.createdTime,
        lastUpdatedTime: instance.lastUpdatedTime,
        runtimeStatus: instance.runtimeStatus,
        customStatus: instance.customStatus,
        history: instance.history,
        input: instance.input,
      };
      output.push(outputObject);
    }
  }

  return output;
}
