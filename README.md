# LeadPulse AI - Business Lead Discovery SaaS Dashboard

> An autonomous AI lead discovery SaaS dashboard for discovering local and international businesses that lack websites, mobile apps, or digital automation, helping developers and agencies close high-ticket clients.

---

## 🚀 Key Features

1. **Autonomous Discovery Agent**:
   - Accepts any **Country** + **City** (50+ built-in international cities, or custom input).
   - Pluggable provider adapters: **Google Places API (New)**, **SerpAPI**, and **OpenStreetMap (Overpass API free fallback)**.
   - Built-in dynamic candidate engine for immediate zero-config testing.
2. **Digital Presence Audit & Opportunity Scoring**:
   - Checks if the business has an active website, an outdated site (HTTP/old builder), or no site at all.
   - Checks for dedicated mobile applications.
   - Vertical AI automation potential matrix (Clinics, Restaurants, Salons, Home Services, Auto Repair, etc.).
   - Computes composite **Opportunity Score ($0-100$)** with personalized sales pitch angles.
3. **SaaS Dashboard Interface**:
   - **Overview / Home**: 5 KPI stats cards, prime deals feed, recent activity log, quick scan button.
   - **Agent Control Panel**: Country/City selector, Industry filter, batch size, Run Now button, schedule toggle, live activity console.
   - **Leads Directory**: Sortable, filterable table, search bar, opportunity score indicator, status updater, bulk selection.
   - **Slide-over Lead Detail**: Full profile, click-to-call, Google Maps link, notes editor, tag manager, activity timeline.
   - **Export & Reports**: RFC 4180 CSV export, raw JSON export, city/industry distribution charts.
   - **Settings**: API Key vault (Google Places, SerpAPI, OpenAI), cron scheduler, email alert preferences.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons, TypeScript
- **Backend**: Next.js Serverless Route Handlers (`/api/leads`, `/api/agent/run`, `/api/settings`, `/api/leads/export`)
- **Database**: Supabase (PostgreSQL with RLS, Triggers, Realtime) + Built-in Local Storage fallback
- **Agent Intelligence**: Multi-provider scrapers + Digital Audit Pipeline + Heuristic Scoring Matrix

---

## 📦 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## 📚 Documentation Index

- [Deliverable 1: System Architecture Diagram](docs/architecture_diagram.md)
- [Deliverable 2: Database Schema & SQL Migration](docs/DATABASE_SCHEMA.md) and [`supabase/schema.sql`](supabase/schema.sql)
- [Deliverable 3: Agent Workflow & Scoring Logic](docs/AGENT_WORKFLOW.md)
- [Deliverable 7: Production Deployment Guide](docs/DEPLOYMENT.md)
