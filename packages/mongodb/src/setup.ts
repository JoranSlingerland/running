import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

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
  console.log('Database setup complete.');
}

export { setupDatabase };
