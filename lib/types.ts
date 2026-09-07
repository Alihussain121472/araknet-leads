export type WebsiteStatus = 'no_website' | 'outdated' | 'active' | 'unreachable';
export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'won' | 'lost';
export type RunStatus = 'idle' | 'running' | 'completed' | 'failed';
export type TriggerType = 'manual' | 'schedule' | 'n8n_webhook';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  business_name: string;
  country: string;
  city: string;
  address?: string;
  phone?: string;
  industry: string;
  website_url?: string | null;
  website_status: WebsiteStatus;
  has_app: boolean | null;
  app_store_url?: string | null;
  google_maps_url?: string;
  google_rating?: number;
  google_reviews_count?: number;
  social_links?: SocialLinks;
  ai_automation_potential: number; // 0-100
  opportunity_score: number; // 0-100
  opportunity_reason?: string;
  suggested_services: string[];
  lead_status: LeadStatus;
  tags: string[];
  source_provider: string;
  agent_run_id?: string;
  notes_count?: number;
}

export interface AgentLog {
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface AgentRun {
  id: string;
  created_at: string;
  updated_at: string;
  country: string;
  city: string;
  industry?: string;
  status: RunStatus;
  leads_found_count: number;
  leads_qualified_count: number;
  run_duration_ms?: number;
  logs: AgentLog[];
  triggered_by: TriggerType;
  error_message?: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  created_at: string;
  author: string;
  content: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  created_at: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  google_places_api_key?: string;
  serpapi_api_key?: string;
  apify_api_key?: string;
  openai_api_key?: string;
  schedule_enabled: boolean;
  schedule_frequency: 'daily' | 'weekly';
  schedule_country: string;
  schedule_city: string;
  schedule_industry: string;
  notify_on_complete: boolean;
  notification_email?: string;
}

export interface FilterOptions {
  country?: string;
  city?: string;
  industry?: string;
  website_status?: string;
  has_app?: string; // 'all' | 'true' | 'false'
  min_score?: number;
  lead_status?: string;
  search?: string;
  sort_by?: 'score' | 'date' | 'rating' | 'name';
  sort_dir?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalLeads: number;
  leadsContacted: number;
  proposalsSent: number;
  dealsWon: number;
  conversionRate: number;
  highOpportunityCount: number;
}
