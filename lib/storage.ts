import 'server-only';
import { randomUUID, createHash } from 'crypto';
import { database } from './mongodb';
import { requireAccess } from './auth';
import { Lead, AgentRun, LeadNote, LeadActivity, UserSettings, FilterOptions, DashboardStats, User } from './types';

// =======================
// User Management
// =======================
export async function createUser(user: User): Promise<User> {
  const db = await database();
  await db.collection('la_users').insertOne({ ...user });
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await database();
  const doc = await db.collection('la_users').findOne({ email: email.toLowerCase() });
  return doc as User | null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await database();
  const doc = await db.collection('la_users').findOne({ id });
  return doc as User | null;
}

export async function getAllUsers(): Promise<User[]> {
  const db = await database();
  const data = await db.collection('la_users').find({}).sort({ created_at: -1 }).toArray();
  return data.map(doc => doc as unknown as User);
}

// =======================
// Multi-tenant Core
// =======================
async function records<T>(table: string, user_id: string): Promise<T[]> {
  const db = await database();
  const data = await db.collection(table).find({ 'data.user_id': user_id }).toArray();
  return data.map(doc => doc.data as T);
}

async function save(table: string, id: string, data: any, lead_id?: string) {
  const db = await database();
  const doc = { id, data, ...(lead_id ? { lead_id } : {}) };
  await db.collection(table).updateOne({ id }, { $set: doc }, { upsert: true });
}

async function activity(lead_id: string, activity_type: string, description: string, user_id: string) {
  const item: LeadActivity = { id: randomUUID(), lead_id, user_id, activity_type, description, created_at: new Date().toISOString() };
  await save('la_activities', item.id, item, lead_id);
}

export async function getLeads(filters: FilterOptions = {}): Promise<Lead[]> {
  const auth = await requireAccess();
  let result = await records<Lead>('la_leads', auth.sub);
  const includes = (value: string, query: string) => value.toLowerCase().includes(query.toLowerCase());
  if (filters.search) result = result.filter(l => includes(l.business_name, filters.search!));
  if (filters.country && filters.country !== 'all') result = result.filter(l => l.country === filters.country);
  if (filters.city && filters.city !== 'all') result = result.filter(l => includes(l.city, filters.city!));
  if (filters.industry && filters.industry !== 'all' && filters.industry !== 'All') result = result.filter(l => l.industry === filters.industry);
  if (filters.website_status && filters.website_status !== 'all') result = result.filter(l => l.website_status === filters.website_status);
  if (filters.lead_status && filters.lead_status !== 'all') result = result.filter(l => l.lead_status === filters.lead_status);
  if (filters.has_app && filters.has_app !== 'all') result = result.filter(l => filters.has_app === 'unknown' ? l.has_app === null : l.has_app === (filters.has_app === 'true'));
  if (filters.min_score) result = result.filter(l => l.pitch_score >= filters.min_score!);
  return result.sort((a, b) => {
    const diff = filters.sort_by === 'name' ? a.business_name.localeCompare(b.business_name)
      : filters.sort_by === 'date' ? Date.parse(a.created_at) - Date.parse(b.created_at)
      : filters.sort_by === 'rating' ? (a.google_rating || 0) - (b.google_rating || 0)
      : a.pitch_score - b.pitch_score;
    return filters.sort_dir === 'asc' ? diff : -diff;
  });
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const auth = await requireAccess();
  const db = await database();
  const doc = await db.collection('la_leads').findOne({ id, 'data.user_id': auth.sub });
  return doc ? doc.data as Lead : null;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const auth = await requireAccess();
  const current = await getLeadById(id);
  if (!current || current.user_id !== auth.sub) return null;
  if (updates.lead_status && !['new','contacted','proposal_sent','won','lost'].includes(updates.lead_status)) throw new Error('Invalid lead status');
  if (updates.tags !== undefined && (!Array.isArray(updates.tags) || updates.tags.length > 30 || updates.tags.some(t => typeof t !== 'string' || t.length > 80))) throw new Error('Invalid tags');
  const allowed = { ...(updates.lead_status ? { lead_status: updates.lead_status } : {}), ...(updates.tags ? { tags: Array.from(new Set(updates.tags)) } : {}) };
  const lead = { ...current, ...allowed, id, user_id: auth.sub, created_at: current.created_at, updated_at: new Date().toISOString() };
  await save('la_leads', id, lead);
  if (updates.lead_status && updates.lead_status !== current.lead_status) await activity(id, 'status_change', `Status changed to ${updates.lead_status}`, auth.sub);
  return lead;
}

export async function addLeads(leads: Lead[], limit = leads.length): Promise<Lead[]> {
  const auth = await requireAccess();
  const inserted: Lead[] = [];
  const db = await database();
  for (const lead of leads) {
    if (inserted.length >= limit) break;
    const id = createHash('sha256').update([lead.business_name, lead.country, lead.city, lead.address || '', auth.sub].join('|').toLowerCase()).digest('hex');
    const item = { ...lead, id, user_id: auth.sub };
    
    const existing = await db.collection('la_leads').findOne({ id, 'data.user_id': auth.sub });
    if (!existing) {
        const result = await db.collection('la_leads').updateOne({ id }, { $setOnInsert: { id, data: item } }, { upsert: true });
        if (!result.upsertedCount) continue;
        inserted.push(item); 
        await activity(id, 'discovered', `Discovered in ${lead.city}, ${lead.country}`, auth.sub);
    }
  }
  return inserted;
}

export async function deleteLead(id: string): Promise<boolean> {
  const auth = await requireAccess();
  const db = await database();
  const lead = await getLeadById(id);
  if (!lead || lead.user_id !== auth.sub) return false;
  
  const result = await db.collection('la_leads').deleteOne({ id, 'data.user_id': auth.sub });
  await Promise.all([
    db.collection('la_notes').deleteMany({ lead_id: id, 'data.user_id': auth.sub }), 
    db.collection('la_activities').deleteMany({ lead_id: id, 'data.user_id': auth.sub })
  ]);
  return result.deletedCount > 0;
}

export async function getNotes(leadId: string) { 
  const auth = await requireAccess();
  return (await records<LeadNote>('la_notes', auth.sub)).filter(n => n.lead_id === leadId); 
}

export async function addNote(leadId: string, content: string, author = 'Me'): Promise<LeadNote> {
  const auth = await requireAccess();
  if (!await getLeadById(leadId)) throw new Error('Lead not found');
  if (typeof content !== 'string' || !content.trim() || content.length > 10000) throw new Error('Note must contain 1-10,000 characters');
  const note = { id: randomUUID(), lead_id: leadId, user_id: auth.sub, content, author, created_at: new Date().toISOString() };
  await save('la_notes', note.id, note, leadId);
  await activity(leadId, 'note_added', 'Added a note', auth.sub);
  return note;
}

export async function getActivities(id: string) { 
  const auth = await requireAccess();
  return (await records<LeadActivity>('la_activities', auth.sub)).filter(a => a.lead_id === id).sort((a,b) => b.created_at.localeCompare(a.created_at)); 
}

export async function getAllActivities(limit = 10) { 
  const auth = await requireAccess();
  return (await records<LeadActivity>('la_activities', auth.sub)).sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0,limit); 
}

export async function getRuns() { 
  const auth = await requireAccess();
  return (await records<AgentRun>('la_runs', auth.sub)).sort((a,b) => b.created_at.localeCompare(a.created_at)); 
}

export async function createRun(run: AgentRun) { 
  const auth = await requireAccess();
  const runWithUser = { ...run, user_id: auth.sub };
  await save('la_runs', run.id, runWithUser); 
  return runWithUser; 
}

export async function updateRun(id: string, updates: Partial<AgentRun>) {
  const auth = await requireAccess();
  const current = (await getRuns()).find(r => r.id === id);
  if (!current || current.user_id !== auth.sub) return null;
  const run = { ...current, ...updates, updated_at: new Date().toISOString() };
  await save('la_runs', id, run); 
  return run;
}

const defaults: Partial<UserSettings> = { schedule_enabled: false, schedule_frequency: 'daily', schedule_country: 'Pakistan', schedule_city: 'Karachi', schedule_industry: 'All', notify_on_complete: false, notification_email: '' };

export async function getSettings(): Promise<UserSettings> {
  const auth = await requireAccess();
  const saved = (await records<UserSettings>('la_settings', auth.sub))[0];
  return { ...defaults, ...saved, user_id: auth.sub, google_places_api_key: process.env.GOOGLE_PLACES_API_KEY || saved?.google_places_api_key || '', serpapi_api_key: process.env.SERPAPI_API_KEY || saved?.serpapi_api_key || '' } as UserSettings;
}

export async function updateSettings(updates: Partial<UserSettings>) {
  const auth = await requireAccess();
  const current = await getSettings();
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) throw new Error('Invalid settings');
  const allowedKeys = ['google_places_api_key', 'serpapi_api_key', 'schedule_enabled', 'schedule_frequency', 'schedule_country', 'schedule_city', 'schedule_industry'];
  const clean = Object.fromEntries(Object.entries(updates).filter(([key]) => allowedKeys.includes(key))) as Partial<UserSettings>;
  if (clean.schedule_enabled !== undefined && typeof clean.schedule_enabled !== 'boolean') throw new Error('Invalid schedule');
  if (clean.schedule_frequency && !['daily', 'weekly'].includes(clean.schedule_frequency)) throw new Error('Invalid schedule frequency');
  for (const key of ['schedule_country', 'schedule_city', 'schedule_industry', 'google_places_api_key', 'serpapi_api_key'] as const) {
    if (clean[key] !== undefined && (typeof clean[key] !== 'string' || clean[key]!.length > 512)) throw new Error('Invalid settings value');
  }
  if (clean.schedule_enabled && !process.env.CRON_SECRET) throw new Error('Scheduling needs CRON_SECRET configured in Vercel.');
  if (clean.schedule_enabled && (!(clean.schedule_city ?? current.schedule_city).trim() || !(clean.schedule_country ?? current.schedule_country).trim())) throw new Error('Schedule country and city are required');
  for (const key of ['google_places_api_key','serpapi_api_key','apify_api_key','openai_api_key'] as const) if (clean[key] === undefined || clean[key] === 'configured') delete clean[key];
  const result = { ...current, ...clean, user_id: auth.sub };
  await save('la_settings', auth.sub, result); return result;
}

export function publicSettings(settings: UserSettings) {
  const result = { ...settings };
  for (const key of ['google_places_api_key','serpapi_api_key','apify_api_key','openai_api_key'] as const) result[key] = settings[key] ? 'configured' : '';
  return result;
}

export async function getStats(): Promise<DashboardStats> {
  const leads = await getLeads();
  const dealsWon = leads.filter(l => l.lead_status === 'won').length;
  return { totalLeads: leads.length, leadsContacted: leads.filter(l => l.lead_status === 'contacted').length, proposalsSent: leads.filter(l => l.lead_status === 'proposal_sent').length, dealsWon, conversionRate: leads.length ? Math.round(dealsWon / leads.length * 100) : 0, highOpportunityCount: leads.filter(l => l.pitch_score >= 8).length };
}

export async function acquireAgentLock(): Promise<string | null> {
  const auth = await requireAccess();
  const db = await database();
  const token = randomUUID();
  const now = Date.now();
  try {
    const result = await db.collection('la_locks').findOneAndUpdate(
      { _id: `discovery_${auth.sub}` as any, expires: { $lte: now } },
      { $set: { token, expires: now + 180000, user_id: auth.sub } },
      { upsert: true, returnDocument: 'after' }
    );
    return result?.token === token ? token : null;
  } catch (error: any) {
    if (error.code === 11000) return null;
    throw error;
  }
}
export async function releaseAgentLock(token: string) {
  const auth = await requireAccess();
  const db = await database();
  await db.collection('la_locks').updateOne({ _id: `discovery_${auth.sub}` as any, token }, { $set: { expires: 0 } });
}

export async function getAdminStats() {
  const auth = await requireAccess();
  if (auth.role !== 'admin') throw new Error('Forbidden');
  const db = await database();
  const users = await db.collection('la_users').countDocuments();
  const leads = await db.collection('la_leads').countDocuments();
  const runs = await db.collection('la_runs').countDocuments();
  return { totalUsers: users, totalLeadsSystemWide: leads, totalRunsSystemWide: runs };
}

// =======================
// Proposals & Profiles
// =======================
import { SavedProposal, FreelancerProfile } from './types';

export async function saveProposal(proposal: SavedProposal) {
  const auth = await requireAccess();
  const proposalWithUser = { ...proposal, user_id: auth.sub };
  await save('la_proposals', proposal.id, proposalWithUser, proposal.lead_id);
  return proposalWithUser;
}

export async function getProposals(): Promise<SavedProposal[]> {
  const auth = await requireAccess();
  return (await records<SavedProposal>('la_proposals', auth.sub)).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function deleteProposal(id: string): Promise<boolean> {
  const auth = await requireAccess();
  const db = await database();
  const result = await db.collection('la_proposals').deleteOne({ id, 'data.user_id': auth.sub });
  return result.deletedCount > 0;
}

export async function saveProfile(profile: Partial<FreelancerProfile>) {
  const auth = await requireAccess();
  const existing = await getProfile();
  const cleanProfile: FreelancerProfile = {
    id: auth.sub,
    user_id: auth.sub,
    freelancer_profile: profile.freelancer_profile || existing?.freelancer_profile || '',
    relevant_experience: profile.relevant_experience || existing?.relevant_experience || '',
    proposed_approach: profile.proposed_approach || existing?.proposed_approach || '',
    tone: profile.tone || existing?.tone || 'Professional',
  };
  await save('la_profiles', auth.sub, cleanProfile);
  return cleanProfile;
}

export async function getProfile(): Promise<FreelancerProfile | null> {
  const auth = await requireAccess();
  const data = await records<FreelancerProfile>('la_profiles', auth.sub);
  return data.length > 0 ? data[0] : null;
}
