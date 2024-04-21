import { Streams } from '@repo/types';
import { FindOptions } from 'mongodb';

import { connectToCollection } from './helpers';

async function upsertStreamsToMongoDB(streams: Streams[]): Promise<void> {
  try {
    const collection = await connectToCollection<Streams>('streams');

    const operations = streams.map((stream) => {
      const { _id, ...dataWithoutId } = stream;
      return {
        updateOne: {
          filter: { _id: { $eq: _id } },
          update: { $set: dataWithoutId },
          upsert: true,
        },
      };
    });

    if (operations.length === 0) {
      console.debug('No streams to update or insert.');
      return;
    }
    await collection.bulkWrite(operations);
  } catch (error) {
    console.error('Error inserting or updating streams in MongoDB:', error);
  }
}

async function getLastStreamFromMongoDB(
  userId: string,
): Promise<Streams | undefined> {
  try {
    const collection = await connectToCollection<Streams>('streams');

    const queryOptions: FindOptions<Streams> = {
      sort: { start_date: -1 },
      limit: 1,
    };

    const streams = await collection.find({ userId }, queryOptions).toArray();

    if (streams.length === 0) {
      return undefined;
    }

    return streams[0];
  } catch (error) {
    console.error('Error retrieving last stream from MongoDB:', error);
    return undefined;
  }
}

async function getStreamFromMongoDB(_id: string): Promise<Streams | undefined> {
  try {
    const collection = await connectToCollection<Streams>('streams');

    const stream = await collection.findOne({ _id });

    if (!stream) {
      return undefined;
    }

    return stream;
  } catch (error) {
    console.error('Error retrieving stream from MongoDB:', error);
    return undefined;
  }
}

export {
  upsertStreamsToMongoDB,
  getLastStreamFromMongoDB,
  getStreamFromMongoDB,
};
