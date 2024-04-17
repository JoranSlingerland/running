import { Activity } from '@repo/types';
import { FindOptions } from 'mongodb';

import { connectToCollection } from './helpers';

async function getLastActivityFromMongoDB(
  userId: string,
): Promise<Activity | undefined> {
  try {
    const collection = await connectToCollection<Activity>('activities');

    const queryOptions: FindOptions<Activity> = {
      sort: { start_date: -1 },
      limit: 1,
    };

    const activities = await collection
      .find({ userId }, queryOptions)
      .toArray();

    if (activities.length === 0) {
      return undefined;
    }

    return activities[0];
  } catch (error) {
    console.error('Error retrieving last activity from MongoDB:', error);
    return undefined;
  }
}

async function getActivityFromMongoDB(
  _id: string,
): Promise<Activity | undefined> {
  try {
    const collection = await connectToCollection<Activity>('activities');

    const activity = await collection.findOne({ _id });

    if (!activity) {
      return undefined;
    }

    return activity;
  } catch (error) {
    console.error('Error retrieving activity from MongoDB:', error);
    return undefined;
  }
}

export { getLastActivityFromMongoDB, getActivityFromMongoDB };
