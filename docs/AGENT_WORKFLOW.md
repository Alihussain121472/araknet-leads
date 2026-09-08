# Agent workflow

1. Authenticate and validate the target country, city, industry and batch size (1-20).
2. Acquire a database lease; reject overlapping runs.
3. Save a running record and query the first configured provider. On provider failure try the next provider, ending with OpenStreetMap.
4. Estimate opportunity using directory website metadata, industry and review counts. Apps remain unverified. Website availability and quality are not independently scanned.
5. Insert new leads using deterministic identities; retain existing lead statuses and notes.
6. Save completion counts and logs, then release the lease. Errors are recorded and surfaced.

Scheduled runs use the same pipeline and saved settings, require CRON_SECRET, and skip when disabled or already completed that day. A crashed process loses its lease after three minutes.
