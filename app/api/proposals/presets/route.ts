import { NextResponse } from 'next/server';
import { PRESETS } from '@/lib/proposal-agent/presets';

export async function GET() {
  return NextResponse.json(PRESETS);
}
