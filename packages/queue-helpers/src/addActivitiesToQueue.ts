import { Activity } from '@repo/types';

import { createQueueClient, jsonToBase64 } from './helpers';

async function addActivitiesToQueue(queueName: string, activities: Activity[]) {
  const queueClient = createQueueClient(queueName);
  activities.sort((a, b) => {
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  let visibilityTimeout = 0;
  let count = 1;
  const fifteenMinuteRateLimit =
    (Number(process.env.STRAVA_15MIN_LIMIT) - 2) / 2 || 49;
  const dailyLimit = Number(process.env.STRAVA_DAILY_LIMIT) || 1000;

  for (const activity of activities) {
    if (count > dailyLimit) {
      console.error('Daily limit reached');
      return {
        status: 'error',
        message: 'Daily limit reached',
        activitiesAdded: count - 1,
        activitiesTotal: activities.length,
      };
    }

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
    if (count % fifteenMinuteRateLimit === 0) {
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
    activitiesAdded: activities.length,
    activitiesTotal: activities.length,
  };
}

export { addActivitiesToQueue };
