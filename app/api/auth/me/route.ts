import { NextRequest, NextResponse } from 'next/server';
import { requireAccess } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAccess();
    return NextResponse.json({ user: payload });
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
