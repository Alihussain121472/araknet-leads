import { NextRequest, NextResponse } from 'next/server';
import { getLeads } from '@/lib/storage';
import { FilterOptions } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const filters: FilterOptions = {
      search: searchParams.get('search') || undefined,
      has_app: searchParams.get('has_app') || undefined,
      country: searchParams.get('country') || undefined,
      city: searchParams.get('city') || undefined,
      industry: searchParams.get('industry') || undefined,
      website_status: searchParams.get('website_status') || undefined,
      lead_status: searchParams.get('lead_status') || undefined,
      min_score: searchParams.get('min_score') ? parseInt(searchParams.get('min_score')!, 10) : undefined,
    };

    let leads = await getLeads(filters);
    const ids = searchParams.get('ids')?.split(',');
    if (ids) leads = leads.filter(l=>ids.includes(l.id));

    if (format === 'json') {
      return NextResponse.json({ leads });
    }

    // CSV format
    const headers = [
      'Business Name',
      'Country',
      'City',
      'Industry',
      'Phone',
      'Website Status',
      'Website URL',
      'Has App',
      'Google Rating',
      'Reviews Count',
      'Opportunity Score',
      'Lead Status',
      'Tags',
      'Opportunity Reason',
      'Google Maps URL',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const safe = /^[=+@\-\t\r]/.test(String(val)) ? "'" + String(val) : String(val);
      const str = safe.replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map(l => [
      escapeCsv(l.business_name),
      escapeCsv(l.country),
      escapeCsv(l.city),
      escapeCsv(l.industry),
      escapeCsv(l.phone || ''),
      escapeCsv(l.website_status),
      escapeCsv(l.website_url || ''),
      escapeCsv(l.has_app === null ? 'Unverified' : l.has_app ? 'Yes' : 'No'),
      escapeCsv(l.google_rating || ''),
      escapeCsv(l.google_reviews_count || 0),
      escapeCsv(l.opportunity_score),
      escapeCsv(l.lead_status),
      escapeCsv((l.tags || []).join(', ')),
      escapeCsv(l.opportunity_reason || ''),
      escapeCsv(l.google_maps_url || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
