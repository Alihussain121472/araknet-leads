import { NextRequest, NextResponse } from 'next/server';
import { runDiscoveryAgent } from '@/lib/agent/discovery';
import { getRuns, getSettings } from '@/lib/storage';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.country !== 'string' || typeof body.city !== 'string' || !body.country.trim() || !body.city.trim() || body.city.length > 120 || body.country.length > 120) return NextResponse.json({ success: false, error: 'Valid country and city are required' }, {status: 400});
    if (body.industry !== undefined && (typeof body.industry !== 'string' || body.industry.length > 100)) return NextResponse.json({ success: false, error: 'Invalid industry' }, {status: 400});
    const result = await runDiscoveryAgent({ country: body.country.trim(), city: body.city.trim(), industry: body.industry || 'All', maxResults: Math.max(1, Math.min(20, Number(body.maxResults) || 8)), triggered_by: 'manual' });
    return NextResponse.json({ success: result.run.status === 'completed', runId: result.run.id, status: result.run.status, leadsFound: result.run.leads_found_count, leadsQualified: result.run.leads_qualified_count, logs: result.run.logs, leads: result.leads, error: result.run.error_message });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, {status: 500}); }
}
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('schedule') === 'true') {
      if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, {status:401});
      const settings = await getSettings();
      if (!settings.schedule_enabled) return NextResponse.json({ skipped: true, reason: 'Schedule disabled' });
      if (settings.schedule_frequency === 'weekly' && new Date().getUTCDay() !== 1) return NextResponse.json({ skipped: true, reason: 'Weekly runs occur Monday' });
      const today = new Date().toISOString().slice(0,10);
      const runs = await getRuns();
      if (runs.some(r=>r.triggered_by === 'schedule' && r.created_at.startsWith(today) && r.status === 'completed')) return NextResponse.json({ skipped: true, reason: 'Already completed today' });
      const result = await runDiscoveryAgent({ country: settings.schedule_country, city: settings.schedule_city, industry: settings.schedule_industry, maxResults: 20, triggered_by: 'schedule' });
      return NextResponse.json({ success: result.run.status === 'completed', run: result.run });
    }
    return NextResponse.json({ success: true, runs: await getRuns() });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, {status:500}); }
}
