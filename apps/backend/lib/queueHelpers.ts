import { QueueServiceClient } from '@azure/storage-queue';
import { Activity } from '@repo/types';

function createQueueClient(queueName: string) {
  const connStr = process.env.AzureWebJobsStorage;
  if (!connStr) {
    throw new Error('Environment variable AzureWebJobsStorage is missing');
  }
  const queueServiceClient = QueueServiceClient.fromConnectionString(connStr);
  return queueServiceClient.getQueueClient(queueName);
}

async function addActivitiesToQueue(queueName: string, activities: Activity[]) {
  const queueClient = createQueueClient(queueName);
  activities.sort((a, b) => {
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  let visibilityTimeout = 0;
  let count = 0;

  for (const activity of activities) {
    const response = await queueClient.sendMessage(
      jsonToBase64({
        activityId: activity.id,
        userId: activity.userId,
      }),
      {
        visibilityTimeout: visibilityTimeout,
      },
    );

    if (response._response.status < 200 || response._response.status >= 300) {
      console.error(
        `Failed to add activity to queue: ${response._response.status}`,
      );
    }
    if (count % 45 === 0) {
      visibilityTimeout += 60 * 15;
      console.log(
        'Messages will now start processing at:',
        new Date(Date.now() + visibilityTimeout * 1000),
      );
    }
    count++;
  }

  return {
    status: 'success',
    message: 'Activities added to queue successfully.',
  };
}

function jsonToBase64(jsonObj: object) {
  const jsonString = JSON.stringify(jsonObj);
  return Buffer.from(jsonString).toString('base64');
}

export { createQueueClient, addActivitiesToQueue };
