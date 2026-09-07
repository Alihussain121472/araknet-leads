import { Lead, AgentRun, AgentLog } from '../types';
import { getSettings, addLeads, createRun, updateRun } from '../storage';
import { searchGooglePlaces, RawBusiness } from './providers/google-places';
import { searchSerpApi } from './providers/serpapi';
import { searchOpenStreetMap } from './providers/osm-fallback';
import { randomUUID } from 'crypto';
import { auditAndScore } from './scorer';

export async function runDiscoveryAgent(params: {
  country: string;
  city: string;
  industry?: string;
  maxResults?: number;
  triggered_by?: 'manual' | 'schedule' | 'n8n_webhook';
}): Promise<{ run: AgentRun; leads: Lead[] }> {
  const { country, city, industry = 'All', maxResults = 8, triggered_by = 'manual' } = params;
  const startTime = Date.now();

  const runId = randomUUID();
  const logs: AgentLog[] = [
    {
      time: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Agent started: Scanning ${city}, ${country} for [${industry}] businesses`,
    }
  ];

  const initialRun: AgentRun = {
    id: runId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    country,
    city,
    industry,
    status: 'running',
    leads_found_count: 0,
    leads_qualified_count: 0,
    logs,
    triggered_by,
  };

  await createRun(initialRun);

  const settings = await getSettings();
  let rawBusinesses: RawBusiness[] = [];
  let providerUsed = 'osm';

  try {
    // 1. Determine Provider Strategy
    if (settings.google_places_api_key && settings.google_places_api_key.trim().length > 10) {
      logs.push({
        time: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'Querying Google Places API (New Text Search)...',
      });
      rawBusinesses = await searchGooglePlaces({
        city,
        country,
        industry,
        apiKey: settings.google_places_api_key,
        limit: maxResults,
      });
      providerUsed = 'google_places';
    } else if (settings.serpapi_api_key && settings.serpapi_api_key.trim().length > 10) {
      logs.push({
        time: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'Querying SerpAPI Google Maps engine...',
      });
      rawBusinesses = await searchSerpApi({
        city,
        country,
        industry,
        apiKey: settings.serpapi_api_key,
        limit: maxResults,
      });
      providerUsed = 'serpapi';
    } else {
      logs.push({
        time: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'No paid API keys detected. Connecting to OpenStreetMap / Overpass directory...',
      });
      
      rawBusinesses = await searchOpenStreetMap({
        city,
        country,
        industry,
        limit: maxResults,
      });

      providerUsed = 'osm';
    }

    logs.push({
      time: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Discovered ${rawBusinesses.length} business candidates. Commencing Digital Presence Audit...`,
    });

    // 2. Audit and Score Each Candidate
    const enrichedLeads: Lead[] = [];

    for (const biz of rawBusinesses) {
      const audit = auditAndScore({
        business_name: biz.name,
        industry: biz.industry || industry,
        website_url: biz.website,
        google_rating: biz.rating,
        google_reviews_count: biz.user_ratings_total,
      });

      const tags: string[] = [];
      if (audit.website_status === 'no_website') tags.push('needs website');
      if (audit.website_status === 'outdated') tags.push('outdated site');
      if (audit.ai_automation_potential >= 85) tags.push('automation potential');
      if (audit.opportunity_score >= 85) tags.push('high priority');

      const leadRecord: Lead = {
        id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        business_name: biz.name,
        country,
        city,
        address: biz.address,
        phone: biz.phone,
        industry: biz.industry || industry,
        website_url: biz.website || null,
        website_status: audit.website_status,
        has_app: audit.has_app,
        google_maps_url: biz.maps_url,
        google_rating: biz.rating,
        google_reviews_count: biz.user_ratings_total,
        social_links: {},
        ai_automation_potential: audit.ai_automation_potential,
        opportunity_score: audit.opportunity_score,
        opportunity_reason: audit.opportunity_reason,
        suggested_services: audit.suggested_services,
        lead_status: 'new',
        tags,
        source_provider: providerUsed,
        agent_run_id: runId,
      };

      enrichedLeads.push(leadRecord);
    }

    const qualifiedCount = enrichedLeads.filter(l => l.opportunity_score >= 70).length;

    logs.push({
      time: new Date().toLocaleTimeString(),
      level: 'success',
      message: `Audit completed: ${enrichedLeads.length} leads audited (${qualifiedCount} high-opportunity prospects).`,
    });

    // 3. Persist leads
    const inserted = await addLeads(enrichedLeads);

    // 4. Update Agent Run Record
    const duration = Date.now() - startTime;
    const completedRun: AgentRun = {
      ...initialRun,
      status: 'completed',
      leads_found_count: inserted.length,
      leads_qualified_count: qualifiedCount,
      run_duration_ms: duration,
      logs,
    };

    await updateRun(runId, completedRun);

    return {
      run: completedRun,
      leads: inserted,
    };

  } catch (error: any) {
    logs.push({
      time: new Date().toLocaleTimeString(),
      level: 'error',
      message: `Agent execution encountered an issue: ${error.message || 'Unknown error'}`,
    });

    const failedRun: AgentRun = {
      ...initialRun,
      status: 'failed',
      error_message: error.message,
      run_duration_ms: Date.now() - startTime,
      logs,
    };

    await updateRun(runId, failedRun);
    return { run: failedRun, leads: [] };
  }
}
