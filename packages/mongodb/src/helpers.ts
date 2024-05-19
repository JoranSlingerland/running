import { backendEnv as env } from '@repo/env';
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
      const uri = `mongodb://${env.MONGO_INITDB_ROOT_USERNAME}:${env.MONGO_INITDB_ROOT_PASSWORD}@${env.MONGODB_URI}`;
      MongoDBHelper.client = new MongoClient(uri, { socketTimeoutMS: 5000 });
    }
    if (!MongoDBHelper.db) {
      MongoDBHelper.db = MongoDBHelper.client.db(this.dbName);
    }
    MongoDBHelper.client.connect();
  }

  public rawClient(): MongoClient {
    return MongoDBHelper.client;
  }

  public db(): Db {
    return MongoDBHelper.db;
  }

  public async close(): Promise<void> {
    if (MongoDBHelper.client) {
      await MongoDBHelper.client.close();
    }
  }

  public getCollection<T extends Document>(collectionName: string) {
    return MongoDBHelper.db.collection<T>(collectionName);
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
