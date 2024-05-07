import { Db } from 'mongodb';

import { SchemaUpdate } from '../types';

export const schemaUpdatesActivities: SchemaUpdate[] = [
  {
    version: 0.1,
    update: async (db: Db) => {
      return await db
        .collection('activities')
        .updateMany(
          { version: { $exists: false } },
          { $set: { version: 0.1 } },
        );
    },
  },
  {
    version: 0.2,
    update: async (db: Db) => {
      return await db
        .collection('activities')
        .updateMany(
          { enrichment_tries: { $exists: false }, version: 0.1 },
          { $set: { enrichment_tries: 0, version: 0.2 } },
        );
    },
  },
];

export const schemaUpdatesUsers: SchemaUpdate[] = [
  {
    version: 0.1,
    update: async (db: Db) => {
      return await db
        .collection('users')
        .updateMany(
          { version: { $exists: false } },
          { $set: { version: 0.1 } },
        );
    },
  },
];

export const schemaUpdatesStreams: SchemaUpdate[] = [
  {
    version: 0.1,
    update: async (db: Db) => {
      return await db
        .collection('streams')
        .updateMany(
          { version: { $exists: false } },
          { $set: { version: 0.1 } },
        );
    },
  },
];

export const schemaUpdatesServiceStatus: SchemaUpdate[] = [
  {
    version: 0.1,
    update: async (db: Db) => {
      return await db
        .collection('serviceStatus')
        .updateMany(
          { version: { $exists: false } },
          { $set: { version: 0.1 } },
        );
    },
  },
];
