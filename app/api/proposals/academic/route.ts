import { NextRequest, NextResponse } from 'next/server';
import { AcademicProposalInput } from '@/lib/proposal-agent/types';
import { generateAcademicProposalWithAi } from '@/lib/proposal-agent/ai-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      academic_level,
      proposal_type,
      topic,
      purpose,
      target_audience,
      specific_requirements,
      provider,
      api_key,
      model,
    } = body;

    if (!topic || !purpose) {
      return NextResponse.json(
        { error: 'Missing required parameters: topic and purpose are required.' },
        { status: 400 }
      );
    }

    const input: AcademicProposalInput = {
      academic_level: academic_level || "Master's",
      proposal_type: proposal_type || 'Education Proposal',
      topic,
      purpose,
      target_audience: target_audience || 'Academic Faculty Review Committee',
      specific_requirements: specific_requirements || '',
    };

    const response = await generateAcademicProposalWithAi(input, {
      provider,
      apiKey: api_key,
      model,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in academic proposal generation API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
