import { NextResponse } from 'next/server';
import { getStats, getAllActivities } from '@/lib/storage';

export async function GET() {
  try {
    const stats = await getStats();
    const activities = await getAllActivities(8);
    return NextResponse.json({ success: true, stats, recentActivities: activities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
