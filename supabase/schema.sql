-- ==============================================================================
-- Business Lead Discovery SaaS - Database Schema for Supabase (PostgreSQL)
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: agent_runs (Audit log of automated discovery runs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    industry TEXT DEFAULT 'All',
    status TEXT NOT NULL CHECK (status IN ('idle', 'running', 'completed', 'failed')) DEFAULT 'running',
    leads_found_count INTEGER DEFAULT 0 NOT NULL,
    leads_qualified_count INTEGER DEFAULT 0 NOT NULL,
    run_duration_ms INTEGER DEFAULT 0,
    error_message TEXT,
    logs JSONB DEFAULT '[]'::jsonb NOT NULL,
    triggered_by TEXT DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'schedule', 'n8n_webhook'))
);

-- ------------------------------------------------------------------------------
-- 2. Table: leads (Core business leads discovered by agent)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    business_name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    industry TEXT NOT NULL,
    website_url TEXT,
    website_status TEXT NOT NULL CHECK (website_status IN ('no_website', 'outdated', 'active', 'unreachable')) DEFAULT 'no_website',
    has_app BOOLEAN DEFAULT FALSE NOT NULL,
    app_store_url TEXT,
    google_maps_url TEXT,
    google_rating NUMERIC(3, 2),
    google_reviews_count INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}'::jsonb,
    ai_automation_potential INTEGER CHECK (ai_automation_potential BETWEEN 0 AND 100) DEFAULT 50,
    opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100) NOT NULL DEFAULT 50,
    opportunity_reason TEXT,
    suggested_services TEXT[] DEFAULT '{}'::text[],
    lead_status TEXT NOT NULL CHECK (lead_status IN ('new', 'contacted', 'proposal_sent', 'won', 'lost')) DEFAULT 'new',
    tags TEXT[] DEFAULT '{}'::text[],
    source_provider TEXT DEFAULT 'google_places',
    agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ------------------------------------------------------------------------------
-- 3. Table: lead_notes (Follow-up notes and interaction logs per lead)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author TEXT DEFAULT 'Me' NOT NULL,
    content TEXT NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. Table: lead_activities (Audit trail and timeline of events)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    activity_type TEXT NOT NULL, -- 'discovered', 'status_change', 'note_added', 'tag_added'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ------------------------------------------------------------------------------
-- 5. Table: user_settings (API Keys, Schedule & Notification Settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE DEFAULT 'default_user',
    google_places_api_key TEXT,
    serpapi_api_key TEXT,
    apify_api_key TEXT,
    openai_api_key TEXT,
    schedule_enabled BOOLEAN DEFAULT FALSE,
    schedule_frequency TEXT DEFAULT 'daily' CHECK (schedule_frequency IN ('daily', 'weekly')),
    schedule_country TEXT DEFAULT 'United States',
    schedule_city TEXT DEFAULT 'Miami',
    schedule_industry TEXT DEFAULT 'All',
    notify_on_complete BOOLEAN DEFAULT TRUE,
    notification_email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. Indexes for High Performance Filtering & Searching
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_country_city ON leads(country, city);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_website_status ON leads(website_status);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_score ON leads(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);

-- ------------------------------------------------------------------------------
-- 7. Trigger: Auto-update updated_at timestamp
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE TRIGGER update_agent_runs_updated_at
    BEFORE UPDATE ON agent_runs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. Enable Row Level Security (RLS) & Realtime Publication
-- ------------------------------------------------------------------------------
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Development policy: allow full access for authenticated/anon keys
CREATE POLICY "Allow all access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to agent_runs" ON agent_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lead_notes" ON lead_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lead_activities" ON lead_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_runs;

-- ------------------------------------------------------------------------------
-- 9. Sample Seed Data (For immediate dashboard visualization)
-- ------------------------------------------------------------------------------
INSERT INTO user_settings (user_id, notification_email, schedule_country, schedule_city)
VALUES ('default_user', 'developer@agency.com', 'United States', 'Austin')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO agent_runs (id, country, city, industry, status, leads_found_count, leads_qualified_count, run_duration_ms, logs)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'United States',
    'Austin',
    'Dental Clinic',
    'completed',
    12,
    8,
    4250,
    '[
        {"time": "2026-09-06T22:00:00Z", "level": "info", "message": "Initiating search in Austin, United States for Dental Clinics"},
        {"time": "2026-09-06T22:00:02Z", "level": "info", "message": "Discovered 12 businesses via Google Places API"},
        {"time": "2026-09-06T22:00:03Z", "level": "info", "message": "Completed digital presence audit: 5 without websites, 3 outdated"},
        {"time": "2026-09-06T22:00:04Z", "level": "info", "message": "Successfully scored and stored 12 leads"}
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO leads (
    id, business_name, country, city, address, phone, industry,
    website_url, website_status, has_app, google_maps_url,
    google_rating, google_reviews_count, social_links,
    ai_automation_potential, opportunity_score, opportunity_reason,
    suggested_services, lead_status, tags, agent_run_id
) VALUES 
(
    'b1111111-1111-1111-1111-111111111111',
    'South Congress Family Dentistry',
    'United States',
    'Austin',
    '1402 S Congress Ave, Austin, TX 78704',
    '+1 (512) 555-0198',
    'Clinic & Healthcare',
    NULL,
    'no_website',
    false,
    'https://maps.google.com/?cid=10101',
    4.8,
    142,
    '{"facebook": "facebook.com/socodental"}'::jsonb,
    94,
    95,
    'High-volume dental practice with 140+ 4.8-star reviews but ZERO website or booking portal. Losing dozens of patients weekly to online-enabled competitors.',
    ARRAY['Modern Next.js Website', 'Automated Patient Booking Portal', '24/7 AI Receptionist Bot'],
    'new',
    ARRAY['needs website', 'automation potential', 'high priority'],
    'a1111111-1111-1111-1111-111111111111'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'Bella Vita Trattoria & Pizzeria',
    'United States',
    'Austin',
    '308 E 6th St, Austin, TX 78701',
    '+1 (512) 555-0344',
    'Restaurant',
    'http://bellavitaaustin-old.tripod.com',
    'outdated',
    false,
    'https://maps.google.com/?cid=10102',
    4.5,
    89,
    '{"instagram": "instagram.com/bellavitaatx"}'::jsonb,
    88,
    89,
    'Non-responsive HTTP website with Flash/unrendered PDF menu from 2017. Paying 30% DoorDash fees without their own direct ordering app.',
    ARRAY['Responsive Restaurant Menu & Ordering', 'Table Reservation Bot', 'Customer Loyalty App'],
    'contacted',
    ARRAY['outdated site', 'commission loss', 'follow up'],
    'a1111111-1111-1111-1111-111111111111'
),
(
    'b3333333-3333-3333-3333-333333333333',
    'Apex Automotive Repair & Collision',
    'United States',
    'Austin',
    '8201 Research Blvd, Austin, TX 78758',
    '+1 (512) 555-0812',
    'Automotive',
    NULL,
    'no_website',
    false,
    'https://maps.google.com/?cid=10103',
    4.7,
    210,
    '{}'::jsonb,
    82,
    92,
    'Popular repair center operating entirely on phone calls. Customers cannot get repair status updates or quote requests online.',
    ARRAY['Quote Request Portal', 'SMS/WhatsApp Repair Status Automation', 'SEO Web Presence'],
    'proposal_sent',
    ARRAY['needs website', 'client portal'],
    'a1111111-1111-1111-1111-111111111111'
),
(
    'b4444444-4444-4444-4444-444444444444',
    'Luxe Glow Salon & Spa',
    'United States',
    'Austin',
    '2215 S 1st St, Austin, TX 78704',
    '+1 (512) 555-0921',
    'Salon & Wellness',
    'https://luxeglowspa.com',
    'active',
    false,
    'https://maps.google.com/?cid=10104',
    4.9,
    315,
    '{"instagram": "instagram.com/luxeglowspa"}'::jsonb,
    85,
    68,
    'Has modern brochure website, but lacks online appointment booking and self-service rescheduling. Relies on DM inquiries on Instagram.',
    ARRAY['Custom Booking Integration', 'Automated Appointment Reminders', 'Client Portal'],
    'won',
    ARRAY['automation potential', 'booking app'],
    'a1111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_notes (lead_id, author, content) VALUES
('b1111111-1111-1111-1111-111111111111', 'Me', 'Called front desk. Spoke with receptionist Maria. Doctor Smith is interested in an automated booking system to reduce missed appointments. Scheduled call for Tuesday at 2 PM.'),
('b2222222-2222-2222-2222-222222222222', 'Me', 'Sent introductory pitch highlighting how our direct ordering site saves $1,200/mo on third-party commissions. Follow up in 3 days.');

INSERT INTO lead_activities (lead_id, activity_type, description) VALUES
('b1111111-1111-1111-1111-111111111111', 'discovered', 'Discovered via Austin Dental search run'),
('b1111111-1111-1111-1111-111111111111', 'note_added', 'Added discovery notes on front desk conversation'),
('b2222222-2222-2222-2222-222222222222', 'discovered', 'Discovered via Austin Restaurant search run'),
('b2222222-2222-2222-2222-222222222222', 'status_change', 'Status updated to Contacted');
