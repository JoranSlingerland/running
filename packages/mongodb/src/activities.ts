import { Activity } from '@repo/types';
import { FindOptions } from 'mongodb';

import { MongoDBHelper } from './helpers';

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
  const collection = await new MongoDBHelper().getCollection<Activity>(
    'activities',
  );

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
    const collection = await new MongoDBHelper().getCollection<Activity>(
      'activities',
    );

    const operations = activities.map((activity) => {
      const { _id, ...dataWithoutId } = activity;
      return {
        updateOne: {
          filter: { _id: { $eq: _id } },
          update: { $set: dataWithoutId },
          upsert: true,
        },
      };
    });

    if (operations.length === 0) {
      console.debug('No activities to update or insert.');
      return;
    }
    await collection.bulkWrite(operations);
  } catch (error) {
    console.error('Error inserting or updating activities in MongoDB:', error);
  }
}

type NonFullDataQuery = { full_data: boolean; userId?: string };

async function getNonFullDataActivitiesFromMongoDB(
  userId?: string,
): Promise<Activity[] | undefined> {
  try {
    const collection = await new MongoDBHelper().getCollection<Activity>(
      'activities',
    );

    const queryOptions: FindOptions<Activity> = {
      sort: { start_date: -1 },
    };

    const query: NonFullDataQuery = { full_data: false };
    if (userId) {
      query.userId = userId;
    }

    const activities = await collection.find(query, queryOptions).toArray();

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
