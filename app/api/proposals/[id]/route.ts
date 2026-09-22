import { NextRequest, NextResponse } from 'next/server';
import { saveProposal, getProposals, deleteProposal } from '@/lib/storage';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Fetch existing to ensure ownership
    const proposals = await getProposals();
    const existing = proposals.find(p => p.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const updated = {
      ...existing,
      ...body,
      updated_at: new Date().toISOString()
    };

    const saved = await saveProposal(updated);
    return NextResponse.json({ success: true, proposal: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteProposal(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Not found or forbidden' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
