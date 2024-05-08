import { Db, Document, MongoClient } from 'mongodb';

import {
  schemaUpdatesActivities,
  schemaUpdatesServiceStatus,
  schemaUpdatesStreams,
  schemaUpdatesUsers,
} from './setup/schemaUpdates';
import { CollectionNames, SchemaUpdate } from './types';

let client: MongoClient;

export async function connectToMongoDB(): Promise<Db> {
  if (!client) {
    const host = process.env.MONGODB_URI;
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
    const username = process.env.MONGO_INITDB_ROOT_USERNAME;
    if (!host || !password || !username) {
      throw new Error(
        'Missing MONGO_INITDB_URI or MONGO_INITDB_ROOT_USERNAME or MONGO_INITDB_ROOT_PASSWORD in environment variables.',
      );
    }
    const uri = `mongodb://${username}:${password}@${host}`;
    client = new MongoClient(uri, {
      socketTimeoutMS: 5000,
    });
    await client.connect();
  }

  return client.db('running');
}

export async function connectToCollection<T extends Document>(
  collectionName: string,
) {
  const db = await connectToMongoDB();
  return db.collection<T>(collectionName);
}

export function getLatestSchemaVersion(schema: CollectionNames): number {
  function getLatestVersion(schemaUpdates: SchemaUpdate[]): number {
    let latestVersion = 0;
    for (const update of schemaUpdates) {
      if (update.version > latestVersion) {
        latestVersion = update.version;
      }
    }
    return latestVersion;
  }

  switch (schema) {
    case 'activities':
      return getLatestVersion(schemaUpdatesActivities);
    case 'users':
      return getLatestVersion(schemaUpdatesUsers);
    case 'streams':
      return getLatestVersion(schemaUpdatesStreams);
    case 'serviceStatus':
      return getLatestVersion(schemaUpdatesServiceStatus);
  }
}
