import 'server-only';
import { MongoClient } from 'mongodb';
import { databaseErrorMessage } from './database-error';

let connection: Promise<MongoClient> | undefined;

function cleanUri(raw: string): string {
  let uri = raw.trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
}

export async function database() {
  let uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Database is not configured. Add MONGODB_URI in Vercel.');

  uri = cleanUri(uri);

  if (!connection) {
    let client: MongoClient;
    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        family: 4, // Force IPv4 to prevent IPv6 routing errors on Atlas
        tls: true,
      });
    } catch (error) {
      throw new Error(databaseErrorMessage(error));
    }

    connection = client.connect().catch(async (error) => {
      connection = undefined;
      await client.close().catch(() => {});
      throw new Error(databaseErrorMessage(error));
    });
  }

  return (await connection).db(process.env.MONGODB_DB || 'araknet');
}
