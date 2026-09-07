# Deliverable 1: System Architecture Diagram

This document details the high-level and component architecture for the **Business Lead Discovery SaaS Dashboard**, illustrating how the AI Discovery Agent, external business directory APIs, digital audit scanners, Supabase database, and Next.js 14 frontend interact seamlessly.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph ClientLayer ["1. Presentation Layer (Next.js 14 + Tailwind CSS)"]
        UI_Home["Overview & KPI Metrics"]
        UI_Agent["Agent Control Panel (Country/City Selector)"]
        UI_Table["Leads Management Table (Filters & Sorting)"]
        UI_Detail["Lead Detail & Opportunity Scoring Drawer"]
        UI_Export["Export & Analytics Reports"]
        UI_Settings["Settings & API Key Vault"]
    end

    subgraph APILayer ["2. Next.js Backend & API Routes"]
        API_Agent["/api/agent/run & /api/agent/status"]
        API_Leads["/api/leads & /api/leads/[id]"]
        API_Notes["/api/leads/[id]/notes"]
        API_Export["/api/leads/export (CSV/JSON)"]
        API_Settings["/api/settings"]
    end

    subgraph AgentEngine ["3. AI Agent & Digital Audit Engine"]
        Orchestrator["Agent Orchestrator & Task Queue"]
        
        subgraph DirectoryProviders ["Directory Adapters"]
            GooglePlaces["Google Places API (Primary)"]
            SerpAPI["SerpAPI Google Maps (Fallback 1)"]
            OSM["OpenStreetMap / Overpass (Fallback 2 / Free)"]
        end
        
        subgraph AuditPipeline ["Digital Presence Audit"]
            WebAudit["Website Inspector (HTTP, SSL, Mobile, Outdated)"]
            AppAudit["Mobile App Detector (iOS / Android)"]
            Scoring["AI Automation Potential & Opportunity Scorer"]
        end
    end

    subgraph StorageLayer ["4. Persistence & Realtime (Supabase / PostgreSQL)"]
        DB_Leads[("leads table")]
        DB_Runs[("agent_runs table")]
        DB_Notes[("lead_notes table")]
        DB_Activities[("lead_activities table")]
        DB_Settings[("user_settings table")]
        RealtimeChannel["Supabase Realtime (WebSocket)"]
    end

    subgraph SchedulerLayer ["5. Automation & Trigger Layer"]
        CronTrigger["Scheduled Triggers (Vercel Cron / QStash)"]
        N8NBridge["n8n Workflow Webhook (Optional)"]
        AlertService["Email Notification Dispatcher (Resend / SMTP)"]
    end

    %% Client to API
    UI_Agent -->|POST trigger run| API_Agent
    UI_Table -->|GET leads, PATCH status| API_Leads
    UI_Detail -->|POST notes & tags| API_Notes
    UI_Export -->|GET export stream| API_Export
    UI_Settings -->|POST credentials| API_Settings

    %% API to Agent Engine
    API_Agent --> Orchestrator
    Orchestrator --> DirectoryProviders
    DirectoryProviders --> AuditPipeline

    %% Agent Engine to Storage
    AuditPipeline -->|Upsert enriched leads| DB_Leads
    Orchestrator -->|Log run progress & stats| DB_Runs
    Orchestrator -->|Broadcast status events| RealtimeChannel

    %% Realtime to Client
    RealtimeChannel -.->|Live activity feed & run status| UI_Agent
    RealtimeChannel -.->|Live new leads stream| UI_Table

    %% Storage to APIs
    DB_Leads --> API_Leads
    DB_Notes --> API_Notes
    DB_Settings --> API_Settings
    DB_Runs --> API_Agent

    %% Scheduling
    CronTrigger -->|Trigger cron run| API_Agent
    N8NBridge -->|Trigger via webhook| API_Agent
    Orchestrator -->|Trigger run completed alert| AlertService
```

---

## 2. Component Breakdown & Responsibilities

### 2.1 Presentation Layer (Next.js 14 App Router)
- **Framework**: Next.js 14 with TypeScript and Tailwind CSS.
- **State & Data Fetching**: SWR / TanStack React Query for cached client fetching and real-time syncing.
- **UI Components**: Modern shadcn/ui aesthetic using Lucide React icons, responsive cards, slide-over modals, and searchable command-palette dropdowns for Country and City selection.
- **Realtime Listener**: Subscribes directly to Supabase Realtime PostgreSQL changes on `leads` and `agent_runs` to provide a live-updating activity log and progress indicator.

### 2.2 API Layer (Next.js Serverless Route Handlers)
- **`/api/agent/run`**: Accepts target parameters (`country`, `city`, `industry`, `maxResults`), initializes an `agent_runs` record with status `running`, and invokes the discovery engine asynchronously.
- **`/api/agent/status`**: Returns the active run status, live logs, progress percentage, and lead counters.
- **`/api/leads`**: Provides paginated, searchable, multi-faceted filtering (by Country, City, Industry, Website status, App status, Opportunity Score, and Lead status).
- **`/api/leads/[id]`**: Single lead management endpoint for status transitions (`new` $\rightarrow$ `contacted` $\rightarrow$ `proposal_sent` $\rightarrow$ `won` $\rightarrow$ `lost`) and tag assignments.
- **`/api/leads/export`**: Generates RFC 4180 compliant CSV downloads or formatted JSON based on currently active filters.

### 2.3 AI Agent & Digital Audit Pipeline
The core intelligence engine operates as a sequential 4-stage pipeline:

```mermaid
sequenceDiagram
    autonumber
    participant UI as Dashboard Control Panel
    participant API as Next.js API (/api/agent/run)
    participant Agent as Agent Orchestrator
    participant Provider as Google Places / SerpAPI
    participant Auditor as Digital Audit & Scoring
    participant DB as Supabase PostgreSQL

    UI->>API: POST { country: "US", city: "Miami", industry: "Dentist" }
    API->>DB: INSERT into agent_runs (status: 'running')
    API-->>UI: Return runId & 202 Accepted
    API->>Agent: Start Discovery Task

    Agent->>Provider: Query businesses (Text Search / Nearby)
    Provider-->>Agent: Raw list of places (names, address, phone, website, maps URL)

    loop For Each Business
        Agent->>Auditor: Audit Digital Presence
        Auditor->>Auditor: 1. Check Website (Reachability, SSL, Mobile Viewport, Age)
        Auditor->>Auditor: 2. Check Mobile App Presence (App Store / Play Store match)
        Auditor->>Auditor: 3. Compute AI Automation Potential (Industry matrix)
        Auditor->>Auditor: 4. Compute Opportunity Score (0 - 100) & Pitch Angles
        Auditor-->>Agent: Enriched Lead Profile
        Agent->>DB: Upsert into leads table
        Agent->>DB: Record lead_activities event
    end

    Agent->>DB: UPDATE agent_runs (status: 'completed', leads_found: count)
    Agent-->>UI: Realtime WebSocket emits run_completed
```

### 2.4 Data & Persistence Layer (Supabase / PostgreSQL)
- **PostgreSQL Database**: Relational model with foreign keys, index optimization on `city`, `country`, `industry`, `opportunity_score`, and `status`.
- **Realtime Engine**: Pushes Postgres write events (`INSERT`, `UPDATE`) to connected frontend clients over WebSockets without requiring frequent polling.
- **Row Level Security (RLS)**: Protects leads, notes, and credentials per authenticated user or single-tenant admin key.

### 2.5 Scheduling & Alert Layer
- **Vercel Cron / QStash**: Dispatches scheduled HTTP calls to `/api/agent/run` using an authorized Bearer token on daily or weekly intervals.
- **Email Notifications**: Triggers transactional completion emails (via Resend or SMTP) containing a summary of high-opportunity leads found during the run.

---

## 3. Data Flow Specification

| Step | Component | Data Transferred | Destination |
| :--- | :--- | :--- | :--- |
| **1. Trigger** | Dashboard UI | `{ country, city, industry, schedule }` | `/api/agent/run` |
| **2. Search** | Directory Adapter | Geocoded query `"{industry} in {city}, {country}"` | Google Places / SerpAPI / OSM |
| **3. Audit** | Audit Worker | HTTP HEAD/GET, DNS resolve, Viewport header | Target business domain (if exists) |
| **4. Score** | Scoring Engine | Industry matrix + Digital Audit flags | Opportunity Score ($0 - 100$) + Reason Breakdown |
| **5. Store** | Agent Orchestrator | Normalized Enriched Lead Record | Supabase `leads` & `agent_runs` |
| **6. Stream** | Supabase Realtime | New Record Payload | Dashboard UI live feeds |
| **7. Export** | Export API | Filtered Lead Dataset | RFC 4180 CSV / PDF report |
