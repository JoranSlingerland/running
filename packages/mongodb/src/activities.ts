import { Activity } from '@repo/types';
import { FindOptions } from 'mongodb';

import { connectToCollection } from './helpers';

async function upsertActivitiesToMongoDB(
  activities: Activity[],
): Promise<void> {
  try {
    const collection = await connectToCollection<Activity>('activities');

    const operations = activities.map((activity) => {
      const { _id, ...dataWithoutId } = activity;
      return {
        updateOne: {
          filter: { _id },
          update: { $set: dataWithoutId },
          upsert: true,
        },
      };
    });

    if (operations.length === 0) {
      console.log('No activities to update or insert.');
      return;
    }
    const result = await collection.bulkWrite(operations);

    console.log(`${result.modifiedCount} activities updated.`);
    console.log(`${result.upsertedCount} activities inserted.`);
  } catch (error) {
    console.error('Error inserting or updating activities in MongoDB:', error);
  }
}

async function getNonFullDataActivitiesFromMongoDB(): Promise<
  Activity[] | undefined
> {
  try {
    const collection = await connectToCollection<Activity>('activities');

    const queryOptions: FindOptions<Activity> = {
      sort: { start_date: -1 },
    };

    const activities = await collection
      .find({ full_data: false }, queryOptions)
      .toArray();

    if (activities.length === 0) {
      return undefined;
    }

    return activities;
  } catch (error) {
    console.error(
      'Error retrieving non-full data activities from MongoDB:',
      error,
    );
    return undefined;
  }
}

export { upsertActivitiesToMongoDB, getNonFullDataActivitiesFromMongoDB };
