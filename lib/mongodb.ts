import 'server-only';
import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function database() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please add your Mongo URI to environment variables (MONGODB_URI)');
  }

  if (!clientPromise) {
    if (process.env.NODE_ENV === 'development') {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri);
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
  }

  const c = await clientPromise;
  return c.db('araknet');
}
