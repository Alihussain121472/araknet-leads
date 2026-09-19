import { NextRequest, NextResponse } from 'next/server';
import { analyzeRedFlags } from '@/lib/proposal-agent/red-flag-detector';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { job_description, budget_range } = body;

    if (!job_description) {
      return NextResponse.json({ has_flags: false, reasons: [] });
    }

    const result = analyzeRedFlags(job_description, budget_range || '');
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error analyzing red flags' },
      { status: 500 }
    );
  }
}
