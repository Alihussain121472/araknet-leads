import { NextRequest, NextResponse } from 'next/server';
import { getProposals, saveProposal, deleteProposal } from '@/lib/storage';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const proposals = await getProposals();
    return NextResponse.json({ success: true, proposals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProposal = {
      id: randomUUID(),
      user_id: '', // Filled in by saveProposal
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lead_id: body.lead_id,
      business_name: body.business_name,
      platform: body.platform || 'Direct Email',
      content: body.content,
      is_structured: body.is_structured || false,
    };

    const saved = await saveProposal(newProposal);
    return NextResponse.json({ success: true, proposal: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
