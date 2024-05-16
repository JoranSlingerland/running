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
    MongoDBHelper.client.connect();
  }

  // TODO: Can this be done in the constructor?
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
