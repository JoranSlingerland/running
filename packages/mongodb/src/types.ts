import { Db, UpdateResult } from 'mongodb';

export interface SchemaUpdate {
  version: number;
  update: (db: Db) => Promise<UpdateResult<Document>>;
}

export type CollectionNames =
  | 'activities'
  | 'users'
  | 'streams'
  | 'serviceStatus';

export type LegacyCollectionNames = 'notifications';
