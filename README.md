# Araknet Business Discovery

Owner dashboard built with Next.js 16, React 19, TypeScript and MongoDB Atlas.

## Setup

Install with `npm ci`, copy `.env.example` to `.env.local`, set `MONGODB_URI` and `DASHBOARD_PASSWORD`, then run `npm run dev`. Sign in at `/login` with username `owner` and your configured password. Production uses secure, HTTP-only signed sessions. Changing the dashboard password invalidates existing sessions.

## Workflows

- Discover real businesses using Google Places, SerpAPI, or OpenStreetMap. Failed providers fall back to the next available directory.
- Review leads, change pipeline status, add tags and notes, and export CSV or JSON.
- Configure daily or Monday-only weekly discovery in Agent Control. Vercel invokes the cron at 09:00 UTC; the saved schedule must be enabled and `CRON_SECRET` configured. Hobby timing may vary within the hour.
- Website status is inferred from directory listings and URL patterns. App availability is unverified. Scores and service suggestions are rules-based; they are not a live website audit or AI-generated pitch. Email notifications are not implemented.

## Validation

`npm test` tests authentication invariants. `npm run lint` checks TypeScript. `npm run build` validates the production build.

## Deployment

The intended production project is `araknet-leads-c463` in `alihussain121472s-projects`, serving araknet.tech. The repository explicitly selects the Next.js Vercel framework. Check project identity before deploying: older local links may point to a separate project.

MongoDB Atlas must permit the deployment's network connections. Existing records are preserved. Do not commit environment files or credentials.
