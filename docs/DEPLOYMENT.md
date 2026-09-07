# Deliverable 7: Production Deployment & Hosting Guide

This guide provides end-to-end instructions for deploying the **Business Lead Discovery SaaS Dashboard** to production using **Vercel** (Frontend & Serverless API Routes) and **Supabase** (PostgreSQL Database & Realtime).

---

## 1. Prerequisites

Before starting, ensure you have free accounts with:
1. [GitHub](https://github.com) (Source code repository)
2. [Vercel](https://vercel.com) (Next.js hosting & Cron trigger)
3. [Supabase](https://supabase.com) (Database, Authentication & Realtime)
4. (Optional) [Google Cloud Console](https://console.cloud.google.com) for Google Places API key or [SerpAPI](https://serpapi.com)

---

## 2. Setting Up the Database (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and click **New project**.
2. Set a project name (e.g., `leadpulse-saas`) and strong database password. Choose the closest region.
3. Once the database is provisioned, navigate to the **SQL Editor** tab on the left sidebar.
4. Click **New query**, open [`supabase/schema.sql`](../supabase/schema.sql), paste its full contents, and click **Run**.
5. This creates:
   - `leads`, `agent_runs`, `lead_notes`, `lead_activities`, and `user_settings` tables.
   - High-performance indexes on `country`, `city`, `industry`, `opportunity_score`, and `lead_status`.
   - Realtime publication subscriptions.
   - Initial seed records for testing.
6. Navigate to **Project Settings** $\rightarrow$ **API** and copy:
   - `Project URL` $\rightarrow$ `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` $\rightarrow$ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` $\rightarrow$ `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Local Development & Verification

To run and test the application on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional for local testing - built-in resilient storage is active)
cp .env.example .env.local

# 3. Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> The dashboard comes with a built-in mock fallback store. You can test discovering leads, filtering, updating pipeline stages, and downloading CSV files immediately without needing paid API keys on your first launch.

---

## 4. Deploying to Vercel

1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Lead Discovery SaaS"
   git branch -M main
   git remote add origin https://github.com/your-username/lead-discovery-saas.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `GOOGLE_PLACES_API_KEY`: (Optional) Your Google Places API key
   - `SERPAPI_API_KEY`: (Optional) Your SerpAPI key
   - `CRON_SECRET`: Generate a random secure string (e.g. `openssl rand -hex 32`)
5. Click **Deploy**. Vercel will build and deploy your application in under 60 seconds.

---

## 5. Configuring Automated Recurring Scheduling (Vercel Cron)

To have your agent automatically discover businesses every morning without manual clicks:

1. Create a `vercel.json` file in the root directory:
   ```json
   {
     "crons": [
       {
         "path": "/api/agent/run?schedule=true",
         "schedule": "0 9 * * *"
       }
     ]
   }
   ```
2. In your Vercel Project Settings $\rightarrow$ Environment Variables, ensure `CRON_SECRET` matches.
3. Every day at 9:00 AM UTC, Vercel will trigger the agent with your default configured city and industry.

---

## 6. Optional: Connecting an n8n Workflow

If you prefer orchestrating the agent via an external **n8n** automation:

1. Create a new workflow in n8n.
2. Add a **Cron Node** (Trigger every 24 hours).
3. Add an **HTTP Request Node**:
   - Method: `POST`
   - URL: `https://your-dashboard.vercel.app/api/agent/run`
   - Headers: `Authorization: Bearer <CRON_SECRET>`
   - Body:
     ```json
     {
       "country": "United States",
       "city": "Miami",
       "industry": "Clinic & Healthcare",
       "triggered_by": "n8n_webhook"
     }
     ```
4. Activate the n8n workflow. Every time it runs, new leads are streamed directly into your dashboard!
