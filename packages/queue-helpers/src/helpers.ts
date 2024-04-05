import { QueueServiceClient } from '@azure/storage-queue';

function jsonToBase64(jsonObj: object) {
  const jsonString = JSON.stringify(jsonObj);
  return Buffer.from(jsonString).toString('base64');
}

function createQueueClient(queueName: string) {
  const connStr = process.env.AzureWebJobsStorage;
  if (!connStr) {
    throw new Error('Environment variable AzureWebJobsStorage is missing');
  }
  const queueServiceClient = QueueServiceClient.fromConnectionString(connStr);
  return queueServiceClient.getQueueClient(queueName);
}

export { createQueueClient, jsonToBase64 };
