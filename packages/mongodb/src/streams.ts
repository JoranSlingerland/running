import { Streams } from '@repo/types';

import { MongoDBHelper } from './helpers';

async function upsertStreamsToMongoDB(streams: Streams[]): Promise<void> {
  try {
    const collection = new MongoDBHelper().getCollection<Streams>('streams');

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

async function getStreamFromMongoDB(_id: string): Promise<Streams | undefined> {
  try {
    const collection = new MongoDBHelper().getCollection<Streams>('streams');

    const stream = await collection.findOne({ _id: { $eq: _id } });

    if (!stream) {
      return undefined;
    }

    return stream;
  } catch (error) {
    console.error('Error retrieving stream from MongoDB:', error);
    return undefined;
  }
}

export { upsertStreamsToMongoDB, getStreamFromMongoDB };
