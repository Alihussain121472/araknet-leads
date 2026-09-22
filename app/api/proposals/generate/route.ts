import { NextRequest, NextResponse } from 'next/server';
import { ProposalInput } from '@/lib/proposal-agent/types';
import { generateProposalWithAi } from '@/lib/proposal-agent/ai-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platform,
      job_description,
      freelancer_profile,
      relevant_experience,
      proposed_approach,
      budget_range,
      tone,
      achievements,
      provider,
      api_key,
      model,
    } = body;

    if (!job_description || !freelancer_profile || !proposed_approach) {
      return NextResponse.json(
        { error: 'Missing required parameters: job_description, freelancer_profile, and proposed_approach are required.' },
        { status: 400 }
      );
    }

    const input: ProposalInput = {
      platform: platform || 'Upwork',
      job_description,
      freelancer_profile,
      relevant_experience: relevant_experience || '',
      proposed_approach,
      budget_range: budget_range || '',
      tone: tone || 'Professional',
      achievements: achievements || '',
      is_structured: Boolean(body.is_structured),
    };

    const response = await generateProposalWithAi(input, {
      provider,
      apiKey: api_key,
      model,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in proposal generation API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
