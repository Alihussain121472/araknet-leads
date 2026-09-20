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
  stronger_variation: string;
  stronger_reason: string;
  what_to_personalize: string;
  smart_question: string;
  win_probability_factors: string;
}

export interface ProposalResponse {
  red_flag_alert?: string | null;
  variation_a: ProposalVariation;
  variation_b: ProposalVariation;
  coaching_note: CoachingNote;
  raw_formatted: string;
  provider_used: string;
  validation_status: 'PASS' | 'WARNINGS_REVIEWED';
}

// ==================== Academic & Professional Proposal Types ====================

export type AcademicLevel = "Bachelor's" | "Master's" | "PhD";
export type AcademicProposalType = 'Education Proposal' | 'Business Proposal' | 'Social Media Proposal';

export interface AcademicProposalInput {
  academic_level: AcademicLevel;
  proposal_type: AcademicProposalType;
  topic: string;
  purpose: string;
  target_audience?: string;
  specific_requirements?: string;
}

export interface AcademicProposalResponse {
  title: string;
  academic_level: AcademicLevel;
  proposal_type: AcademicProposalType;
  introduction_background: string;
  problem_statement: string;
  objectives: string[];
  methodology_approach: string;
  expected_outcomes_benefits: string;
  conclusion: string;
  raw_markdown: string;
  word_count: number;
  provider_used: string;
  level_insights: string;
}

