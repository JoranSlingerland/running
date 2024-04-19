import { Document, WithId } from 'mongodb';

import { connectToCollection } from './helpers';

interface DocumentWithId extends Document {
  _id: string;
}

async function serviceStatusFromMongoDB<T extends DocumentWithId>(
  _id: string,
): Promise<WithId<T> | undefined> {
  try {
    const collection = await connectToCollection<T>('serviceStatus');

    const document = await collection.findOne({
      _id,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!document) {
      return undefined;
    }

    return document;
  } catch (error) {
    console.error('Error retrieving user settings from MongoDB:', error);
    return undefined;
  }
}

async function upsertServiceStatusToMongoDB<T extends DocumentWithId>(
  serviceStatus: T,
): Promise<void> {
  try {
    const collection = await connectToCollection<T>('serviceStatus');

    const result = await collection.updateOne(
      { _id: serviceStatus._id } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { $set: serviceStatus },
      { upsert: true },
    );

    console.debug(`${result.upsertedCount} activities inserted.`);
  } catch (error) {
    console.error('Error inserting or updating activities in MongoDB:', error);
  }
}

export { serviceStatusFromMongoDB, upsertServiceStatusToMongoDB };