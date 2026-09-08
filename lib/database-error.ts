export function databaseErrorMessage(error: unknown): string {
  const value = error as { name?: string; code?: string | number; cause?: { code?: string | number } };
  if (value?.code === 18 || value?.code === 8000) return 'MongoDB rejected the database credentials. Update MONGODB_URI with a valid Atlas database username and password.';
  const code = value?.code || value?.cause?.code;
  if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'EAI_AGAIN') return 'MongoDB cluster address could not be resolved. Check the cluster hostname in MONGODB_URI and that the Atlas cluster is active.';
  if (value?.name === 'MongoServerSelectionError' || value?.name === 'MongoNetworkTimeoutError') return 'MongoDB servers could not be reached. Check that the Atlas cluster is active and its Network Access rules allow your Vercel deployment.';
  if (value?.name === 'MongoParseError' || value?.name === 'MongoInvalidArgumentError') return 'MONGODB_URI is not a valid MongoDB connection string. Copy the driver connection string from Atlas and URL-encode the database password.';
  return 'Database connection failed. Check the MongoDB credentials and Atlas network access.';
}
