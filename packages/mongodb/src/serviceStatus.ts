import { Document, WithId } from 'mongodb';

import { MongoDBHelper } from './helpers';

interface DocumentWithId extends Document {
  _id: string;
}

async function serviceStatusFromMongoDB<T extends DocumentWithId>(
  _id: string,
): Promise<WithId<T> | undefined> {
  try {
    const collection = new MongoDBHelper().getCollection<T>('serviceStatus');

    const document = await collection.findOne({
      _id,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!document) {
      return undefined;
    }

    return document;
  } catch (error) {
    console.error('Error retrieving service status from MongoDB:', error);
    return undefined;
  }
}

async function upsertServiceStatusToMongoDB<T extends DocumentWithId>(
  serviceStatus: T,
): Promise<void> {
  try {
    const collection = new MongoDBHelper().getCollection<T>('serviceStatus');

    await collection.updateOne(
      { _id: serviceStatus._id } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { $set: serviceStatus },
      { upsert: true },
    );
  } catch (error) {
    console.error('Error inserting or updating services in MongoDB:', error);
  }
}

export { serviceStatusFromMongoDB, upsertServiceStatusToMongoDB };
