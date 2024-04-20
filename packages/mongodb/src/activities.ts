import { Activity } from '@repo/types';
import { FindOptions } from 'mongodb';

import { connectToCollection } from './helpers';

interface Query {
  userId: string;
  start_date?: {
    $gte?: string;
    $lte?: string;
  };
}

async function activitiesFromMongoDB({
  id,
  startDate = '',
  endDate = '',
}: {
  id: string;
  startDate?: string;
  endDate?: string;
}): Promise<Activity[] | undefined> {
  const collection = await connectToCollection<Activity>('activities');

  const query: Query = { userId: id };

  if (startDate) {
    query.start_date = { $gte: startDate };
  }
  if (endDate) {
    if (query.start_date) {
      query.start_date.$lte = endDate;
    } else {
      query.start_date = { $lte: endDate };
    }
  }

  const activities = await collection.find(query).toArray();

  if (!activities || activities.length === 0) {
    return undefined;
  }

  return activities;
}

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
      console.debug('No activities to update or insert.');
      return;
    }
    const result = await collection.bulkWrite(operations);

    console.debug(`${result.modifiedCount} activities updated.`);
    console.debug(`${result.upsertedCount} activities inserted.`);
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

export {
  upsertActivitiesToMongoDB,
  getNonFullDataActivitiesFromMongoDB,
  activitiesFromMongoDB,
};
