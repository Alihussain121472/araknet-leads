import 'server-only';
import { randomUUID, createHash } from 'crypto';
import { database } from './mongodb';
import { requireAccess } from './auth';
import { Lead, AgentRun, LeadNote, LeadActivity, UserSettings, FilterOptions, DashboardStats } from './types';

async function records<T>(table: string): Promise<T[]> {
  await requireAccess();
  const db = await database();
  const data = await db.collection(table).find({}).toArray();
  return data.map(doc => doc.data as T);
}

async function save(table: string, id: string, data: unknown, lead_id?: string) {
  await requireAccess();
  const db = await database();
  const doc = { id, data, ...(lead_id ? { lead_id } : {}) };
  await db.collection(table).updateOne({ id }, { $set: doc }, { upsert: true });
}

async function activity(lead_id: string, activity_type: string, description: string) {
  const item: LeadActivity = { id: randomUUID(), lead_id, activity_type, description, created_at: new Date().toISOString() };
  await save('la_activities', item.id, item, lead_id);
}

export async function getLeads(filters: FilterOptions = {}): Promise<Lead[]> {
  let result = await records<Lead>('la_leads');
  const includes = (value: string, query: string) => value.toLowerCase().includes(query.toLowerCase());
  if (filters.search) result = result.filter(l => includes(l.business_name, filters.search!));
  if (filters.country) result = result.filter(l => l.country === filters.country);
  if (filters.city) result = result.filter(l => includes(l.city, filters.city!));
  if (filters.industry && filters.industry !== 'All') result = result.filter(l => l.industry === filters.industry);
  if (filters.website_status && filters.website_status !== 'all') result = result.filter(l => l.website_status === filters.website_status);
  if (filters.lead_status && filters.lead_status !== 'all') result = result.filter(l => l.lead_status === filters.lead_status);
  if (filters.has_app && filters.has_app !== 'all') result = result.filter(l => filters.has_app === 'unknown' ? l.has_app === null : l.has_app === (filters.has_app === 'true'));
  if (filters.min_score) result = result.filter(l => l.opportunity_score >= filters.min_score!);
  return result.sort((a, b) => {
    const diff = filters.sort_by === 'name' ? a.business_name.localeCompare(b.business_name)
      : filters.sort_by === 'date' ? Date.parse(a.created_at) - Date.parse(b.created_at)
      : filters.sort_by === 'rating' ? (a.google_rating || 0) - (b.google_rating || 0)
      : a.opportunity_score - b.opportunity_score;
    return filters.sort_dir === 'asc' ? diff : -diff;
  });
}

export async function getLeadById(id: string): Promise<Lead | null> {
  await requireAccess();
  const db = await database();
  const doc = await db.collection('la_leads').findOne({ id });
  return doc ? doc.data as Lead : null;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const current = await getLeadById(id);
  if (!current) return null;
  if (updates.lead_status && !['new','contacted','proposal_sent','won','lost'].includes(updates.lead_status)) throw new Error('Invalid lead status');
  const lead = { ...current, ...updates, id, created_at: current.created_at, updated_at: new Date().toISOString() };
  await save('la_leads', id, lead);
  if (updates.lead_status && updates.lead_status !== current.lead_status) await activity(id, 'status_change', `Status changed to ${updates.lead_status}`);
  return lead;
}

export async function addLeads(leads: Lead[]): Promise<Lead[]> {
  const inserted: Lead[] = [];
  const db = await database();
  await requireAccess();
  for (const lead of leads) {
    const id = createHash('sha256').update([lead.business_name, lead.country, lead.city, lead.address || ''].join('|').toLowerCase()).digest('hex');
    const item = { ...lead, id };
    
    // Check if exists
    const existing = await db.collection('la_leads').findOne({ id });
    if (!existing) {
        await save('la_leads', id, item);
        inserted.push(item); 
        await activity(id, 'discovered', `Discovered in ${lead.city}, ${lead.country}`);
    }
  }
  return inserted;
}

export async function deleteLead(id: string): Promise<boolean> {
  await requireAccess();
  const db = await database();
  await db.collection('la_leads').deleteOne({ id });
  return true;
}

export async function getNotes(leadId: string) { return (await records<LeadNote>('la_notes')).filter(n => n.lead_id === leadId); }
export async function addNote(leadId: string, content: string, author = 'Me'): Promise<LeadNote> {
  if (!content.trim() || content.length > 10000) throw new Error('Note must contain 1-10,000 characters');
  const note = { id: randomUUID(), lead_id: leadId, content, author, created_at: new Date().toISOString() };
  await save('la_notes', note.id, note, leadId);
  await activity(leadId, 'note_added', 'Added a note');
  return note;
}
export async function getActivities(id: string) { return (await records<LeadActivity>('la_activities')).filter(a => a.lead_id === id).sort((a,b) => b.created_at.localeCompare(a.created_at)); }
export async function getAllActivities(limit = 10) { return (await records<LeadActivity>('la_activities')).sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0,limit); }
export async function getRuns() { return (await records<AgentRun>('la_runs')).sort((a,b) => b.created_at.localeCompare(a.created_at)); }
export async function createRun(run: AgentRun) { await save('la_runs', run.id, run); return run; }
export async function updateRun(id: string, updates: Partial<AgentRun>) {
  const current = (await getRuns()).find(r => r.id === id);
  if (!current) return null;
  const run = { ...current, ...updates, updated_at: new Date().toISOString() };
  await save('la_runs', id, run); return run;
}
const defaults: UserSettings = { user_id: 'owner', schedule_enabled: false, schedule_frequency: 'daily', schedule_country: 'Pakistan', schedule_city: 'Karachi', schedule_industry: 'All', notify_on_complete: false, notification_email: '' };
export async function getSettings(): Promise<UserSettings> {
  const saved = (await records<UserSettings>('la_settings'))[0];
  return { ...defaults, ...saved, google_places_api_key: process.env.GOOGLE_PLACES_API_KEY || saved?.google_places_api_key || '', serpapi_api_key: process.env.SERPAPI_API_KEY || saved?.serpapi_api_key || '' };
}
export async function updateSettings(updates: Partial<UserSettings>) {
  const current = await getSettings();
  const clean = { ...updates };
  for (const key of ['google_places_api_key','serpapi_api_key','apify_api_key','openai_api_key'] as const) if (!clean[key] || clean[key] === 'configured') delete clean[key];
  const result = { ...current, ...clean, user_id: 'owner' };
  await save('la_settings', 'owner', result); return result;
}
export function publicSettings(settings: UserSettings) {
  const result = { ...settings };
  for (const key of ['google_places_api_key','serpapi_api_key','apify_api_key','openai_api_key'] as const) result[key] = settings[key] ? 'configured' : '';
  return result;
}
export async function getStats(): Promise<DashboardStats> {
  const leads = await getLeads();
  const dealsWon = leads.filter(l => l.lead_status === 'won').length;
  return { totalLeads: leads.length, leadsContacted: leads.filter(l => l.lead_status === 'contacted').length, proposalsSent: leads.filter(l => l.lead_status === 'proposal_sent').length, dealsWon, conversionRate: leads.length ? Math.round(dealsWon / leads.length * 100) : 0, highOpportunityCount: leads.filter(l => l.opportunity_score >= 80).length };
}
