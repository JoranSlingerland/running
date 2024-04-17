import { Db, Document, MongoClient } from 'mongodb';

let client: MongoClient;

export async function connectToMongoDB(): Promise<Db> {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Missing MONGODB_URI environment variable');
    }
    client = new MongoClient(uri);
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
