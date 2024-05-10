import { Db, Document, MongoClient } from 'mongodb';

import {
  schemaUpdatesActivities,
  schemaUpdatesServiceStatus,
  schemaUpdatesStreams,
  schemaUpdatesUsers,
} from './setup/schemaUpdates';
import { CollectionNames, SchemaUpdate } from './types';

export class MongoDBHelper {
  private static client: MongoClient;
  private static db: Db;
  private readonly dbName = 'running';

  constructor() {
    if (!MongoDBHelper.client) {
      const host = process.env.MONGODB_URI;
      const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
      const username = process.env.MONGO_INITDB_ROOT_USERNAME;

      if (!host || !password || !username) {
        throw new Error(
          'Missing MONGO_INITDB_URI or MONGO_INITDB_ROOT_USERNAME or MONGO_INITDB_ROOT_PASSWORD in environment variables.',
        );
      }

      const uri = `mongodb://${username}:${password}@${host}`;
      MongoDBHelper.client = new MongoClient(uri, { socketTimeoutMS: 5000 });
    }
    MongoDBHelper.client.connect();
  }

  public async connect(): Promise<Db> {
    if (!MongoDBHelper.db) {
      MongoDBHelper.db = MongoDBHelper.client.db(this.dbName);
    }
    return MongoDBHelper.db;
  }

  public async rawClient(): Promise<MongoClient> {
    return MongoDBHelper.client;
  }

  public async close(): Promise<void> {
    if (MongoDBHelper.client) {
      await MongoDBHelper.client.close();
    }
  }

  public async getCollection<T extends Document>(collectionName: string) {
    const db = await this.connect();
    return db.collection<T>(collectionName);
  }
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
