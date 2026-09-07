import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings, publicSettings } from '@/lib/storage';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, settings: publicSettings(settings) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateSettings(body);
    return NextResponse.json({ success: true, settings: publicSettings(updated) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
