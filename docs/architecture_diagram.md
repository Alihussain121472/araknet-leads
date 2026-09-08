# Architecture

Browser dashboard -> authenticated Next.js route handlers -> MongoDB Atlas.

Discovery: Google Places -> SerpAPI -> OpenStreetMap fallback on provider failure. Directory records pass through heuristic scoring, deduplication and MongoDB persistence. A database lease prevents overlapping runs. HTTP-only signed cookies protect dashboard sessions; routes also enforce access at the storage layer. Vercel cron uses a separate bearer secret.

Collections: la_leads, la_notes, la_activities, la_runs, la_settings and la_locks. There is no browser-local mock database or realtime subscription. The browser refreshes after runs and user changes.
