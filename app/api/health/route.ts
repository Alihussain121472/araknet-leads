import { NextResponse } from 'next/server';
import { requireAccess } from '@/lib/auth';
import { database } from '@/lib/mongodb';
import { getSettings } from '@/lib/storage';
export const dynamic = 'force-dynamic';
export async function GET() {
  await requireAccess();
  let databaseReady = false;
  let message = 'Database connected';
  let directory = 'OpenStreetMap (no paid key required)';
  let scheduleEnabled = false;
  try {
    await (await database()).command({ ping: 1 });
    const settings = await getSettings();
    databaseReady = true;
    scheduleEnabled = settings.schedule_enabled;
    if (settings.google_places_api_key) directory = 'Google Places with directory fallback';
    else if (settings.serpapi_api_key) directory = 'SerpAPI with OpenStreetMap fallback';
  } catch (error) { message = error instanceof Error ? error.message : 'Database unavailable'; }
  return NextResponse.json({ databaseReady, message, directory, cronConfigured: Boolean(process.env.CRON_SECRET), scheduleEnabled, checkedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'private, no-store' } });
}
