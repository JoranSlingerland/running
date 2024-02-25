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

  for (const activity of activities) {
    const response = await queueClient.sendMessage(
      jsonToBase64({
        activity_id: activity.id,
        user_id: activity.userId,
      }),
    );

    if (response._response.status < 200 || response._response.status >= 300) {
      console.error(
        `Failed to add activity to queue: ${response._response.status}`,
      );
    }
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
