export function databaseErrorMessage(error: unknown): string {
  const err = error as any;
  const msg = err?.message || String(error);

  // If bad credentials
  if (err?.code === 18 || err?.code === 8000 || msg.includes('auth') || msg.includes('Authentication')) {
    return 'MongoDB rejected credentials: Username or password in MONGODB_URI is incorrect (make sure to remove any < or > brackets).';
  }

  if (err?.code === 'ENOTFOUND' || err?.code === 'EAI_AGAIN') {
    return 'MongoDB hostname could not be resolved. Check the MongoDB URI and DNS/network settings.';
  }

  if (err?.name === 'MongoParseError') {
    return 'MONGODB_URI is not a valid MongoDB connection string. Check its format and encoding.';
  }

  // A server-selection failure usually means Atlas Network Access, DNS, or a paused cluster.
  if (err?.name === 'MongoServerSelectionError') {
    if (!err?.reason?.servers) {
      return 'MongoDB servers could not be reached. Check that the Atlas cluster is active and its Network Access rules allow the deployment.';
    }
    const serverDetails: string[] = [];
    for (const [, desc] of err.reason.servers) {
      if (desc?.error?.message) {
        serverDetails.push(desc.error.message);
      }
    }
    if (serverDetails.length > 0) {
      return `MongoDB connection issue. Check Atlas Network Access and cluster availability: ${serverDetails[0].replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, 'the configured cluster')}`;
    }
    return 'MongoDB servers could not be reached. Check that the Atlas cluster is active and its Network Access rules allow the deployment.';
  }

  const sanitizedMsg = msg
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, 'the configured MongoDB cluster')
    .replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  return `MongoDB connection error: ${sanitizedMsg}`;
}
