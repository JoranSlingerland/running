import { Streams } from '@repo/types';

import { connectToCollection } from './helpers';

async function upsertStreamsToMongoDB(streams: Streams[]): Promise<void> {
  try {
    const collection = await connectToCollection<Streams>('streams');

    const operations = streams.map((stream) => {
      const { _id, ...dataWithoutId } = stream;
      return {
        updateOne: {
          filter: { _id },
          update: { $set: dataWithoutId },
          upsert: true,
        },
      };
    });

    if (operations.length === 0) {
      console.debug('No streams to update or insert.');
      return;
    }
    const result = await collection.bulkWrite(operations);

    console.debug(`${result.modifiedCount} activities updated.`);
    console.debug(`${result.upsertedCount} activities inserted.`);
  } catch (error) {
    console.error('Error inserting or updating activities in MongoDB:', error);
  }
}

export { upsertStreamsToMongoDB };
