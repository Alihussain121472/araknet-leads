# Production deployment

Use Vercel project `araknet-leads-c463`, team `alihussain121472s-projects`. Set the framework to Next.js (also pinned in vercel.json). Production domains: araknet.tech and www.araknet.tech.

Required server variables: MONGODB_URI, DASHBOARD_PASSWORD. Optional: MONGODB_DB (defaults to araknet), GOOGLE_PLACES_API_KEY, SERPAPI_API_KEY. CRON_SECRET is required for scheduled discovery.

Sign in at /login with owner and the existing dashboard password. Secrets are server-only; never commit environment files. MongoDB Atlas must allow the deployment to connect.

Run npm test and npm run build before deployment. Deploy explicitly to the named project. Verify unauthenticated API requests are rejected, sign-in works, leads load, a small discovery completes, and export works. Schedules remain disabled until enabled in Agent Control.

The cron is configured for 09:00 UTC daily; weekly schedules run on Monday. Settings control the saved target. Paid directory providers are optional; OpenStreetMap is the fallback. Email alerts and generated AI pitches are not implemented.
