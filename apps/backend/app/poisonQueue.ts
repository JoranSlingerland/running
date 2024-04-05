import { randomUUID } from 'crypto';

import { InvocationContext } from '@azure/functions';
import { upsertWithBackOff } from '@repo/cosmosdb';

async function handlePoisonQueue(
  queueItem: unknown,
  context: InvocationContext,
): Promise<void> {
  let userId: string;
  let activityId: number | string;

  if (
    !queueItem ||
    typeof queueItem !== 'object' ||
    !('activityId' in queueItem) ||
    !('userId' in queueItem) ||
    typeof queueItem.activityId !== 'number' ||
    typeof queueItem.userId !== 'string'
  ) {
    userId = 'unknown';
    activityId = 'unknown';
  } else {
    userId = queueItem.userId;
    activityId = queueItem.activityId;
  }

  const notification = {
    id: randomUUID().toString(),
    status: 'failed',
    message: queueItem,
    userId: userId,
    activityId: activityId,
    timestamp: new Date().toISOString(),
    queue: context?.triggerMetadata?.queueName || 'unknown',
  };

  await upsertWithBackOff('notifications', notification);
}

export { handlePoisonQueue };
