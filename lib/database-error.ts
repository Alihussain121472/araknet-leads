export function databaseErrorMessage(error: unknown): string {
  const err = error as any;
  const msg = err?.message || String(error);

  // If bad credentials
  if (err?.code === 18 || err?.code === 8000 || msg.includes('auth') || msg.includes('Authentication')) {
    return 'MongoDB rejected credentials: Username or password in MONGODB_URI is incorrect (make sure to remove any < or > brackets).';
  }

  // Extract server-level detail from MongoServerSelectionError
  if (err?.name === 'MongoServerSelectionError' && err?.reason?.servers) {
    const serverDetails: string[] = [];
    for (const [, desc] of err.reason.servers) {
      if (desc?.error?.message) {
        serverDetails.push(desc.error.message);
      }
    }
    if (serverDetails.length > 0) {
      return `MongoDB connection issue: ${serverDetails[0]}`;
    }
  }

  return `MongoDB connection error: ${msg}`;
}
