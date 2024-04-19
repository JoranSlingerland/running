import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

async function setupDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'Missing MONGO_INITDB_URI environment variable. DB setup failed.',
    );
  }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('running');
    const collections = ['activities', 'users', 'notifications', 'streams'];

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
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.close();
    console.log('Connection to MongoDB closed.');
  }
}

export { setupDatabase };
