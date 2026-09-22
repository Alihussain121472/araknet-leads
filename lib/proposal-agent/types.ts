export type Platform = 'Upwork' | 'Direct Email' | 'LinkedIn' | 'Agency RFP' | 'Other';
export type Tone = 'Professional' | 'Friendly' | 'Direct' | 'Consultative';

export interface ProposalInput {
  platform: Platform;
  job_description: string;
  freelancer_profile: string;
  relevant_experience: string;
  proposed_approach: string;
  budget_range?: string;
  tone: Tone;
  achievements?: string;
  is_structured: boolean;
}

export interface RedFlagResult {
  has_flags: boolean;
  reasons: string[];
  alert_text?: string;
}

export interface ProposalVariation {
  title: string;
  angle: string;
  text: string;
  word_count: number;
  warnings: string[];
}

export interface CoachingNote {
  what_to_personalize: string;
  smart_question: string;
}

export interface ProposalResponse {
  red_flag_alert?: string | null;
  draft: string;
  word_count: number;
  coaching_note: CoachingNote;
  raw_formatted: string;
  provider_used: string;
  validation_status: 'PASS' | 'WARNINGS_REVIEWED';
}

