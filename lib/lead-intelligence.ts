import type { Lead } from './types';

export function leadIntelligence(lead: Lead) {
  const phone = Boolean(lead.phone?.replace(/\D/g, '').match(/^\d{7,15}$/));
  const reviews = Math.max(0, lead.google_reviews_count || 0);
  const breakdown = {
    'Website opportunity': lead.website_status === 'no_website' ? 40 : lead.website_status === 'outdated' ? 25 : lead.website_status === 'unreachable' ? 15 : 0,
    'Industry fit': Math.round(Math.max(0, Math.min(100, lead.ai_automation_potential || 0)) * .25),
    'Contact availability': phone ? 20 : 0,
    'Review evidence': reviews >= 100 ? 15 : reviews >= 30 ? 10 : reviews > 0 ? 5 : 0,
  };
  const priority = Object.values(breakdown).reduce((sum, points) => sum + points, 0);
  const completeness = Math.round([lead.address, phone, lead.google_maps_url, lead.website_url, reviews > 0].filter(Boolean).length / 5 * 100);
  const age = Math.max(0, Math.floor((Date.now() - Date.parse(lead.updated_at || lead.created_at)) / 86400000));
  const nextAction = lead.lead_status === 'won' ? 'Plan onboarding and confirm project scope.' : lead.lead_status === 'lost' ? 'Keep archived unless the business asks to reconnect.' : lead.lead_status === 'proposal_sent' ? 'Follow up on the proposal and ask about decision timing.' : lead.lead_status === 'contacted' ? 'Review your last interaction and agree a next step.' : !phone ? 'Find and verify a public business contact before outreach.' : lead.website_status === 'no_website' ? 'Verify the business has no current website, then call with a specific offer.' : 'Review the website and ask which workflow costs the team the most time.';
  const service = lead.suggested_services?.[0] || 'a simpler online enquiry and booking workflow';
  const observation = lead.website_status === 'no_website'
    ? 'I could not find a website in the directory listing I reviewed. Do you already have one?'
    : 'I came across your business listing and wanted to learn more about your online enquiry process.';
  const draft = `Hi ${lead.business_name} team,\n\n${observation} I help businesses in ${lead.city} with ${service.toLowerCase()}.\n\nWould a short conversation about your current process be useful? I can suggest a practical improvement after understanding what you need.\n\n[Your name]\n[Your business and contact details]`;
  return { priority, breakdown, completeness, phone, age: Number.isFinite(age) ? age : null, nextAction, draft };
}

export function parseCampaignCities(text: string) {
  const cities = text.split(/[\n,]+/).map(city => city.trim()).filter(Boolean);
  const seen = new Set<string>();
  return cities.filter(city => { const key = city.toLocaleLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; });
}
