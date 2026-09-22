import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const profile = await getProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = await saveProfile(body);
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
