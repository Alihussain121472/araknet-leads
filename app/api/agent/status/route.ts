import { NextResponse } from 'next/server';
import { getRuns } from '@/lib/storage';

export async function GET() {
  try {
    const runs = await getRuns();
    const latest = runs.length > 0 ? runs[0] : null;

    return NextResponse.json({
      success: true,
      status: latest ? latest.status : 'idle',
      latestRun: latest,
      recentLogs: latest ? latest.logs : [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
