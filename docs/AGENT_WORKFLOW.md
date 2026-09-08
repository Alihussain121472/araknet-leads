# Agent workflow

1. Authenticate and validate the target country, city, industry and batch size (1-20).
2. Acquire a database lease; reject overlapping runs.
3. Save a running record and query the first configured provider. On provider failure or an empty response try the next provider, ending with OpenStreetMap.
4. Estimate opportunity using directory website metadata, industry and review counts. Apps remain unverified. Website availability and quality are not independently scanned.
5. Rank up to 20 candidates by opportunity, contact availability and review evidence, then insert the requested number of new leads using deterministic identities; retain existing lead statuses and notes.
6. Save completion counts and logs, then release the lease. Errors are recorded and surfaced.

Scheduled runs use the same pipeline and saved settings, require CRON_SECRET, and skip when disabled or already completed that day. A crashed process loses its lease after three minutes.

Growth Workspace coordinates up to five sequential city requests from the browser. Each completed city is persisted independently; the browser must remain on the page. Its shortlist and editable outreach drafts also work with previously saved leads.
