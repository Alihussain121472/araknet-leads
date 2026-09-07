import { NextRequest, NextResponse } from 'next/server';
import { getNotes, addNote } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const notes = await getNotes((await params).id);
    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ success: false, error: 'Note content is required' }, { status: 400 });
    }

    const note = await addNote((await params).id, body.content.trim(), body.author || 'Me');
    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
