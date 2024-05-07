import dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';

import {
  schemaUpdatesActivities,
  schemaUpdatesServiceStatus,
  schemaUpdatesStreams,
  schemaUpdatesUsers,
} from './schemaUpdates';
import { CollectionNames, LegacyCollectionNames, SchemaUpdate } from '../types';

dotenv.config();

async function setupDatabase() {
  console.log('Setting up database...');
  const host = process.env.MONGODB_URI;
  const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
  const username = process.env.MONGO_INITDB_ROOT_USERNAME;
  if (!host || !password || !username) {
    throw new Error(
      'Missing MONGO_INITDB_URI or MONGO_INITDB_ROOT_USERNAME or MONGO_INITDB_ROOT_PASSWORD in environment variables.',
    );
  }
  const uri = `mongodb://${username}:${password}@${host}`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Creating collections...');
    const collections: CollectionNames[] = [
      'activities',
      'users',
      'streams',
      'serviceStatus',
    ];
    await createCollections(client.db('running'), collections);

    console.log('Deleting legacy collections...');
    const legacyCollections: LegacyCollectionNames[] = ['notifications'];
    await deleteCollections(client.db('running'), legacyCollections);

    console.log('Updating documents schema...');
    await updateDocumentsSchema(client.db('running'));

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Connection to MongoDB closed.');
  }
}

async function createCollections(db: Db, collections: CollectionNames[]) {
  for (const collection of collections) {
    const collectionList = await db
      .listCollections({ name: collection })
      .toArray();
    if (collectionList.length === 0) {
      await db.createCollection(collection);
      console.log(`Collection '${collection}' created.`);
    } else {
      console.log(`Collection '${collection}' already exists.`);
    }
  }
}

async function deleteCollections(db: Db, collections: LegacyCollectionNames[]) {
  for (const collection of collections) {
    const collectionList = await db
      .listCollections({ name: collection })
      .toArray();
    if (collectionList.length > 0) {
      await db.collection(collection).drop();
      console.log(`Collection '${collection}' deleted.`);
    } else {
      console.log(`Collection '${collection}' does not exist.`);
    }
  }
}

async function updateDocumentsSchema(db: Db) {
  const schemas: { collection: CollectionNames; updates: SchemaUpdate[] }[] = [
    { collection: 'activities', updates: schemaUpdatesActivities },
    { collection: 'users', updates: schemaUpdatesUsers },
    { collection: 'streams', updates: schemaUpdatesStreams },
    { collection: 'serviceStatus', updates: schemaUpdatesServiceStatus },
  ];

  for (const schema of schemas) {
    for (const update of schema.updates) {
      const result = await update.update(db);
      if (result.modifiedCount > 0) {
        console.log(
          `Updated ${result.modifiedCount} documents in '${schema.collection}' to version ${update.version}.`,
        );
        break;
      }
      console.log(
        `All documents in ${schema.collection} already at version ${update.version}.`,
      );
    }
  }
}

export { setupDatabase };
