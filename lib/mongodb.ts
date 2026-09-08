import 'server-only';
import { MongoClient } from 'mongodb';
let connection: Promise<MongoClient> | undefined;
export async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Database is not configured. Add MONGODB_URI in Vercel.');
  if (!connection) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, maxPoolSize: 10 });
    connection = client.connect().catch(async () => {
      connection = undefined;
      await client.close().catch(() => {});
      throw new Error('Database connection failed. Check the MongoDB credentials and Atlas network access.');
    });
  }
  return (await connection).db(process.env.MONGODB_DB || 'araknet');
}
