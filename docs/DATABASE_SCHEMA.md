# Deliverable 2: Database Schema Documentation

This document explains the relational database architecture designed for **Supabase (PostgreSQL)** in the Business Lead Discovery SaaS.

The SQL migration script is located at [`supabase/schema.sql`](file:///c:/Users/DELL/OneDrive/Desktop/Leads%20Agent/supabase/schema.sql).

---

## Tables Overview

### 1. `leads`
Stores every discovered business, its contact info, the digital presence audit results, AI automation score, and current pipeline status.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique lead identifier (`uuid_generate_v4()`) |
| `business_name` | `TEXT` | Name of the local or international business |
| `country` | `TEXT` | Country of location (e.g. "United States", "United Kingdom", "Canada") |
| `city` | `TEXT` | City (e.g. "Miami", "Austin", "London") |
| `address` | `TEXT` | Physical address formatted from directory listing |
| `phone` | `TEXT` | Formatted international or national phone number |
| `industry` | `TEXT` | Category: `restaurant`, `clinic`, `salon`, `automotive`, `retail`, `plumbing`, etc. |
| `website_url` | `TEXT` | Target website URL (if found) |
| `website_status` | `TEXT` | Status: `no_website`, `outdated`, `active`, or `unreachable` |
| `has_app` | `BOOLEAN` | Whether the business has a mobile app in app stores |
| `app_store_url` | `TEXT` | App Store / Google Play link if detected |
| `google_maps_url` | `TEXT` | Direct Google Maps / Places link for street view and verification |
| `google_rating` | `NUMERIC(3,2)`| Google review rating (e.g. `4.8`) |
| `google_reviews_count` | `INTEGER` | Total number of Google reviews |
| `social_links` | `JSONB` | Extracted links: `{"instagram": "...", "facebook": "..."}` |
| `ai_automation_potential` | `INTEGER` | 0-100 score based on vertical automation opportunities |
| `opportunity_score` | `INTEGER` | 0-100 composite ranking of digital sales opportunity |
| `opportunity_reason` | `TEXT` | AI explanation of why this business needs digital/app/automation services |
| `suggested_services` | `TEXT[]` | Tailored service offerings (e.g., `Modern Website`, `Booking Portal`, `AI Voice Bot`) |
| `lead_status` | `TEXT` | Funnel status: `new`, `contacted`, `proposal_sent`, `won`, `lost` |
| `tags` | `TEXT[]` | Custom badges (e.g. `needs website`, `automation potential`, `high priority`) |
| `source_provider` | `TEXT` | Source: `google_places`, `serpapi`, `osm`, `manual` |
| `agent_run_id` | `UUID` (FK) | Reference to `agent_runs.id` that discovered this lead |
| `created_at` / `updated_at`| `TIMESTAMPTZ` | Timestamp records |

---

### 2. `agent_runs`
Tracks all background or on-demand automated discovery runs, parameters, metrics, duration, and runtime logs.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique run identifier |
| `country` | `TEXT` | Target country selected for the run |
| `city` | `TEXT` | Target city searched |
| `industry` | `TEXT` | Industry filter specified (or "All") |
| `status` | `TEXT` | Execution state: `idle`, `running`, `completed`, `failed` |
| `leads_found_count` | `INTEGER` | Total raw businesses identified |
| `leads_qualified_count` | `INTEGER` | Businesses scored as qualified leads (Score $\ge 60$) |
| `run_duration_ms` | `INTEGER` | Total execution duration in milliseconds |
| `logs` | `JSONB` | Chronological list of timestamped log entries |
| `triggered_by` | `TEXT` | `manual`, `schedule`, or `n8n_webhook` |
| `error_message` | `TEXT` | Error details if run failed |

---

### 3. `lead_notes`
Maintains multiple timestamped personal follow-up notes for each lead.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Note identifier |
| `lead_id` | `UUID` (FK) | Foreign key pointing to `leads(id)` (ON DELETE CASCADE) |
| `author` | `TEXT` | Author name (defaults to "Me") |
| `content` | `TEXT` | Note text (call logs, meeting notes, custom proposals) |
| `created_at` | `TIMESTAMPTZ` | Note creation timestamp |

---

### 4. `lead_activities`
Event stream and audit trail for tracking client lifecycle events.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Activity event identifier |
| `lead_id` | `UUID` (FK) | Foreign key to `leads(id)` |
| `activity_type` | `TEXT` | `discovered`, `status_change`, `note_added`, `tag_added` |
| `description` | `TEXT` | Human-readable explanation of the action taken |
| `metadata` | `JSONB` | Supplemental event payload (e.g. `{ "previous_status": "new", "new_status": "contacted" }`) |

---

### 5. `user_settings`
Encapsulates API keys, cron schedules, and notification preferences.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Settings identifier |
| `user_id` | `TEXT` (Unique)| Single-tenant or user ID |
| `google_places_api_key` | `TEXT` | Google Places API key |
| `serpapi_api_key` | `TEXT` | SerpAPI key |
| `apify_api_key` | `TEXT` | Apify key |
| `openai_api_key` | `TEXT` | OpenAI API key for pitch generation |
| `schedule_enabled` | `BOOLEAN` | Whether automatic cron search is active |
| `schedule_frequency` | `TEXT` | `daily` or `weekly` |
| `schedule_country` / `city` | `TEXT` | Default scheduled targets |
| `notify_on_complete` | `BOOLEAN` | Dispatch email when agent run completes |
| `notification_email` | `TEXT` | Target email address for notifications |
