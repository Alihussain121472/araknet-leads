import { NextRequest, NextResponse } from 'next/server';
import { getLeads, addLeads } from '@/lib/storage';
import { FilterOptions, Lead } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: FilterOptions = {
      country: searchParams.get('country') || undefined,
      city: searchParams.get('city') || undefined,
      industry: searchParams.get('industry') || undefined,
      website_status: searchParams.get('website_status') || undefined,
      has_app: searchParams.get('has_app') || undefined,
      lead_status: searchParams.get('lead_status') || undefined,
      search: searchParams.get('search') || undefined,
      min_score: searchParams.get('min_score') ? parseInt(searchParams.get('min_score')!, 10) : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'score',
      sort_dir: (searchParams.get('sort_dir') as any) || 'desc',
    };

    const leads = await getLeads(filters);
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLead: Lead = {
      ...body,
      id: body.id || `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lead_status: body.lead_status || 'new',
      tags: body.tags || [],
      suggested_services: body.suggested_services || [],
    };

    await addLeads([newLead]);
    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
