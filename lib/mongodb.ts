import 'server-only';
import { MongoClient } from 'mongodb';
import { databaseErrorMessage } from './database-error';
let connection: Promise<MongoClient> | undefined;
export async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Database is not configured. Add MONGODB_URI in Vercel.');
  if (!connection) {
    let client: MongoClient;
    try { client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, maxPoolSize: 10 }); }
    catch (error) { throw new Error(databaseErrorMessage(error)); }
    connection = client.connect().catch(async (error) => {
      connection = undefined;
      await client.close().catch(() => {});
      throw new Error(databaseErrorMessage(error));
    });
  }
  return (await connection).db(process.env.MONGODB_DB || 'araknet');
}
