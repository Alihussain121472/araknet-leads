'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Zap,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Sliders,
  Flag,
  BarChart2,
  Building2,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Layers
} from 'lucide-react';
import {
  Platform, Tone, ProposalInput, ProposalResponse,
  AcademicLevel, AcademicProposalType, AcademicProposalInput, AcademicProposalResponse
} from '@/lib/proposal-agent/types';
import { PRESETS, academicPresets } from '@/lib/proposal-agent/presets';
import { Lead } from '@/lib/types';

interface ProposalAgentSectionProps {
  leads?: Lead[];
}

export const ProposalAgentSection: React.FC<ProposalAgentSectionProps> = ({ leads = [] }) => {
  // Mode switcher: 'freelance' vs 'academic'
  const [activeMode, setActiveMode] = useState<'freelance' | 'academic'>('freelance');

  // Freelance State
  const [platform, setPlatform] = useState<Platform>('Upwork');
  const [tone, setTone] = useState<Tone>('Direct');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [freelancerProfile, setFreelancerProfile] = useState<string>(
    'Senior Full-Stack & AI Systems Engineer with 7 years production experience.'
  );
  const [relevantExperience, setRelevantExperience] = useState<string>(
    'Built high-performance architectures, async queues, and robust API integrations for VC-backed platforms.'
  );
  const [proposedApproach, setProposedApproach] = useState<string>(
    'Audit data flow, decouple background bottlenecks with asynchronous workers, and deploy with end-to-end test coverage.'
  );
  const [budgetRange, setBudgetRange] = useState<string>('$4,000 - $6,000');
  const [achievements, setAchievements] = useState<string>(
    'Eliminated 100% of serverless timeouts and slashed document analysis latency by 68% on a high-throughput platform.'
  );

  // Academic State
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>("Master's");
  const [academicType, setAcademicType] = useState<AcademicProposalType>('Education Proposal');
  const [academicTopic, setAcademicTopic] = useState<string>('Gamified Mobile Microlearning in STEM Education');
  const [academicPurpose, setAcademicPurpose] = useState<string>(
    'Evaluate whether bite-sized interactive mobile problem sets increase conceptual recall and completion rates compared to traditional worksheets.'
  );
  const [academicAudience, setAcademicAudience] = useState<string>('Academic Faculty Review Committee');
  const [academicRequirements, setAcademicRequirements] = useState<string>('APA 7th edition formatting, 4-month classroom pilot scope.');
  const [academicLoading, setAcademicLoading] = useState<boolean>(false);
  const [academicResult, setAcademicResult] = useState<AcademicProposalResponse | null>(null);
  const [academicCopied, setAcademicCopied] = useState<boolean>(false);

  // Common Engine / Provider State
  const [provider, setProvider] = useState<'offline' | 'gemini' | 'groq' | 'openai'>('offline');
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Freelance Generation State
  const [liveRedFlag, setLiveRedFlag] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProposalResponse | null>(null);

  const [copiedA, setCopiedA] = useState<boolean>(false);
  const [copiedB, setCopiedB] = useState<boolean>(false);
  const [copiedFull, setCopiedFull] = useState<boolean>(false);

  const platformLengths: Record<Platform, string> = {
    Upwork: '180–220 words',
    'Direct Email': '220–300 words',
    LinkedIn: '100–150 words',
    'Agency RFP': '250–350 words',
    Other: '150–300 words',
  };

  // Check freelance red flags whenever job description changes
  useEffect(() => {
    if (activeMode !== 'freelance') return;
    if (!jobDescription || jobDescription.trim().length < 20) {
      setLiveRedFlag(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/proposals/check-red-flags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_description: jobDescription, budget_range: budgetRange }),
        });
        if (res.ok) {
          const data = await res.json();
          setLiveRedFlag(data.has_flags ? data.alert_text : null);
        }
      } catch {
        // silent fail on preview check
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [jobDescription, budgetRange, activeMode]);

  const loadPreset = (id: string) => {
    const preset = PRESETS[id];
    if (!preset) return;
    setPlatform(preset.input.platform);
    setTone(preset.input.tone);
    setJobDescription(preset.input.job_description);
    setFreelancerProfile(preset.input.freelancer_profile);
    setRelevantExperience(preset.input.relevant_experience);
    setProposedApproach(preset.input.proposed_approach);
    setBudgetRange(preset.input.budget_range || '');
    setAchievements(preset.input.achievements || '');
  };

  const loadAcademicPreset = (id: string) => {
    const preset = academicPresets[id];
    if (!preset) return;
    setAcademicLevel(preset.input.academic_level);
    setAcademicType(preset.input.proposal_type);
    setAcademicTopic(preset.input.topic);
    setAcademicPurpose(preset.input.purpose);
    setAcademicAudience(preset.input.target_audience || 'Academic Faculty Review Committee');
    setAcademicRequirements(preset.input.specific_requirements || '');
  };

  const importFromLead = (lead: Lead) => {
    setPlatform('Direct Email');
    setTone('Consultative');
    const websiteStatus = lead.website_url ? `Their website is ${lead.website_url}.` : 'They do not currently have an active website.';
    const suggestions = lead.suggested_services?.join(', ') || 'digital presence and web modernization';

    setJobDescription(
      `Direct Outreach Pitch for ${lead.business_name} (${lead.industry || 'Local Business'}, located in ${lead.city}, ${lead.country}). ` +
      `${websiteStatus} Identified opportunity: ${suggestions}. Lead opportunity score: ${lead.opportunity_score}/100. Goal is to pitch modernization, conversion optimization, and automated lead handling.`
    );
    setFreelancerProfile('Senior Digital Strategist & Web Conversion Consultant specializing in high-converting web systems for local businesses.');
    setRelevantExperience(`Helped similar businesses in the ${lead.industry || 'service'} industry double their inbound customer inquiries through mobile optimization and fast digital booking.`);
    setProposedApproach(`Design and launch an agile, high-converting digital presence with automated customer scheduling and mobile-first speed optimization.`);
    setBudgetRange('$1,500 - $3,000');
    setAchievements('Increased mobile customer conversions by 42% and generated $85,000 in new bookings for regional service businesses.');
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        platform,
        tone,
        job_description: jobDescription,
        freelancer_profile: freelancerProfile,
        relevant_experience: relevantExperience,
        proposed_approach: proposedApproach,
        budget_range: budgetRange,
        achievements,
        provider,
        api_key: apiKey || undefined,
      };

      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Proposal generation failed: ' + (err.error || 'Server error'));
        return;
      }

      const data: ProposalResponse = await res.json();
      setResult(data);
    } catch (err) {
      alert('Error generating proposal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAcademic = async () => {
    if (!academicTopic.trim() || !academicPurpose.trim()) return;
    setAcademicLoading(true);
    setAcademicResult(null);

    try {
      const payload = {
        academic_level: academicLevel,
        proposal_type: academicType,
        topic: academicTopic,
        purpose: academicPurpose,
        target_audience: academicAudience,
        specific_requirements: academicRequirements,
        provider,
        api_key: apiKey || undefined,
      };

      const res = await fetch('/api/proposals/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Academic proposal generation failed: ' + (err.error || 'Server error'));
        return;
      }

      const data: AcademicProposalResponse = await res.json();
      setAcademicResult(data);
    } catch (err) {
      alert('Error generating academic proposal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAcademicLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'a' | 'b' | 'full') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'a') {
        setCopiedA(true);
        setTimeout(() => setCopiedA(false), 2000);
      } else if (type === 'b') {
        setCopiedB(true);
        setTimeout(() => setCopiedB(false), 2000);
      } else {
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 2000);
      }
    });
  };

  const copyAcademicMarkdown = () => {
    if (!academicResult) return;
    navigator.clipboard.writeText(academicResult.raw_markdown).then(() => {
      setAcademicCopied(true);
      setTimeout(() => setAcademicCopied(false), 2000);
    });
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result.raw_formatted], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `proposal_${platform.toLowerCase().replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAcademicMarkdown = () => {
    if (!academicResult) return;
    const blob = new Blob([academicResult.raw_markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `academic_proposal_${academicLevel.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                {activeMode === 'freelance' ? <Briefcase className="w-5 h-5" /> : <GraduationCap className="w-5 h-5 text-indigo-400" />}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeMode === 'freelance' ? 'Proposal Strategist Agent' : 'Academic & Professional Assistant'}
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                activeMode === 'freelance'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {activeMode === 'freelance' ? '$2M+ Win Engine' : "Bachelor's • Master's • PhD"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              {activeMode === 'freelance'
                ? 'Clients do not hire the most qualified freelancer—they hire who makes them feel most understood and confident. Dual psychological variations with live red-flag checks.'
                : "Designed for students and researchers at all levels. Calibrates tone, depth, and scholarly complexity across Education, Business, and Social Media into 7 structured sections."}
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                onClick={() => setActiveMode('freelance')}
                className={`text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'freelance'
                    ? 'bg-emerald-600 text-slate-900 dark:text-white font-semibold shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Freelance Pitch</span>
              </button>
              <button
                onClick={() => setActiveMode('academic')}
                className={`text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'academic'
                    ? 'bg-indigo-600 text-slate-900 dark:text-white font-semibold shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic Assistant</span>
              </button>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
              title="Configure AI Engine"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Engine Settings Bar (collapsible) */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">AI Strategy Engine</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="offline">Araknet Deterministic Engine (Offline - Zero Latency)</option>
                <option value="gemini">Google Gemini (Gemini 2.5 Flash / 1.5 Pro)</option>
                <option value="groq">Groq (Llama 3.3 70B Versatile - Ultra Fast)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              </select>
            </div>
            {provider !== 'offline' && (
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">{provider.toUpperCase()} API Key (Optional)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Defaults to server environment variable if empty"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== MODE 1: FREELANCE STRATEGIST ==================== */}
      {activeMode === 'freelance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              {/* Header with Lead Importer */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Pitch Parameters
                </span>

                {/* Lead Importer Dropdown */}
                {leads.length > 0 && (
                  <div className="relative group">
                    <select
                      onChange={(e) => {
                        const selected = leads.find((l) => (l.id || l.business_name) === e.target.value);
                        if (selected) importFromLead(selected);
                      }}
                      defaultValue=""
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      <option value="" disabled>
                        ⚡ Import from Lead ({leads.length})
                      </option>
                      {leads.slice(0, 15).map((lead) => (
                        <option key={lead.id || lead.business_name} value={lead.id || lead.business_name}>
                          {lead.business_name} ({lead.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Load Preset Scenario</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadPreset('1')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    ✨ AI Full-Stack
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('2')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    📧 CRO Direct Email
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('3')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                  >
                    🚩 Red Flag Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('4')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    💼 Agency RFP
                  </button>
                </div>
              </div>

              {/* 1. Platform Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">1. Target Platform</label>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                    Target: {platformLengths[platform]}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['Upwork', 'Direct Email', 'LinkedIn', 'Agency RFP'] as Platform[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`text-xs py-2 px-2 rounded-xl border transition text-center truncate ${
                        platform === p
                          ? 'bg-blue-600 text-slate-900 dark:text-white font-medium shadow-md shadow-blue-600/30 border-blue-500'
                          : 'bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-800 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tone Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">2. Tone of Voice</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['Professional', 'Friendly', 'Direct', 'Consultative'] as Tone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`text-xs py-1.5 px-2 rounded-xl border transition text-center truncate ${
                        tone === t
                          ? 'bg-slate-700 text-slate-900 dark:text-white border-slate-500 font-medium shadow'
                          : 'bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-800 border-slate-300 dark:border-slate-700/80'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Job Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    3. Client Job Post / Project Brief <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">{jobDescription.length} chars</span>
                </div>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job posting, specifications, budget hints, or requirements here..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-y"
                />
              </div>

              {/* Live Red Flag Warning Banner */}
              {liveRedFlag && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-bold">Caution Detected: </span>
                    <span>{liveRedFlag}</span>
                  </div>
                </div>
              )}

              {/* 4. Freelancer Profile */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">4. Your Freelancer Profile / Niche</label>
                <input
                  type="text"
                  value={freelancerProfile}
                  onChange={(e) => setFreelancerProfile(e.target.value)}
                  placeholder="e.g. Senior Full-Stack & AI Systems Engineer with 7 years production experience"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 5. Relevant Experience */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">5. Relevant Experience for THIS Job</label>
                <textarea
                  rows={2}
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  placeholder="What past project directly maps to their problem?"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              {/* 6. Proposed Approach */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">6. Proposed Technical Approach</label>
                <textarea
                  rows={2}
                  value={proposedApproach}
                  onChange={(e) => setProposedApproach(e.target.value)}
                  placeholder="Your concrete workflow, tools, architecture, and what you do differently"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              {/* 7 & 8: Budget & Achievements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">7. Budget Range / Rate</label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g. $4,000 - $6,000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">8. Quantifiable Result / Proof</label>
                  <input
                    type="text"
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="e.g. Reduced latency by 68%"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !jobDescription.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-slate-900 dark:text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing psychology & crafting variations...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Generate Winning Proposals</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Output (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {!result && !loading && (
              <div className="bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
                  <Sparkles className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">No proposal generated yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
                  Fill in your client job details on the left, or load one of the presets to see both variations with instant coaching.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => loadPreset('1')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    Load AI SaaS Preset
                  </button>
                  <button
                    onClick={() => loadPreset('2')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    Load CRO Direct Email Preset
                  </button>
                  <button
                    onClick={() => loadPreset('4')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    Load Agency RFP Preset
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/3" />
                <div className="h-24 bg-slate-800/60 rounded" />
                <div className="h-28 bg-slate-800/60 rounded" />
                <div className="h-32 bg-slate-800/60 rounded" />
              </div>
            )}

            {result && (
              <div className="space-y-5">
                {/* Red Flag Alert Card */}
                {result.red_flag_alert && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <Flag className="w-4 h-4" /> 🚩 RED FLAG ALERT
                    </div>
                    <p className="leading-relaxed">{result.red_flag_alert}</p>
                  </div>
                )}

                {/* Top Action Bar */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Engine: {result.provider_used}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(result.raw_formatted, 'full')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                    >
                      {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFull ? 'Copied Full Output!' : 'Copy Full Output'}</span>
                    </button>
                    <button
                      onClick={downloadMarkdown}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>

                {/* VARIATION A CARD */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        VARIATION A
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lead with Client Pain</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">{result.variation_a.word_count} words</span>
                      <button
                        onClick={() => copyToClipboard(result.variation_a.text, 'a')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                        title="Copy Variation A"
                      >
                        {copiedA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {result.variation_a.warnings.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                      <span className="font-bold">Linter Notice: </span>
                      <span>{result.variation_a.warnings.join(' | ')}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {result.variation_a.text}
                  </div>
                </div>

                {/* VARIATION B CARD */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        VARIATION B
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lead with Bold Result</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">{result.variation_b.word_count} words</span>
                      <button
                        onClick={() => copyToClipboard(result.variation_b.text, 'b')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                        title="Copy Variation B"
                      >
                        {copiedB ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {result.variation_b.warnings.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                      <span className="font-bold">Linter Notice: </span>
                      <span>{result.variation_b.warnings.join(' | ')}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {result.variation_b.text}
                  </div>
                </div>

                {/* COACHING NOTE CARD */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                      <BarChart2 className="w-4 h-4" /> 📊 STRATEGIC COACHING NOTE
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Recommended: {result.coaching_note.stronger_variation}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">🎯 Stronger Variation Rationale</span>
                      <p className="text-slate-500 dark:text-slate-400">{result.coaching_note.stronger_reason}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">✍️ What to Personalize Before Sending</span>
                      <p className="text-slate-500 dark:text-slate-400">{result.coaching_note.what_to_personalize}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">💡 Smart Question to Add</span>
                      <p className="text-slate-500 dark:text-slate-400 italic">&ldquo;{result.coaching_note.smart_question}&rdquo;</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">🏆 Win Probability Factors</span>
                      <p className="text-slate-500 dark:text-slate-400">{result.coaching_note.win_probability_factors}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODE 2: ACADEMIC & PROFESSIONAL ASSISTANT ==================== */}
      {activeMode === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Academic 4-Step Wizard (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" /> Academic & Professional Wizard
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                  7 Sections
                </span>
              </div>

              {/* Quick Academic Presets */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Load Academic Presets</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadAcademicPreset('1')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    🎓 Bachelor's (Education)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadAcademicPreset('2')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    💼 Master's (Business)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadAcademicPreset('3')}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    🔬 PhD (Social Media)
                  </button>
                </div>
              </div>

              {/* STEP 1: Academic Level */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  STEP 1 — What is your academic level? <span className="text-indigo-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Bachelor's", "Master's", 'PhD'] as AcademicLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAcademicLevel(lvl)}
                      className={`text-xs py-2 px-2 rounded-xl border text-center transition ${
                        academicLevel === lvl
                          ? 'bg-indigo-600 text-slate-900 dark:text-white font-semibold shadow-md shadow-indigo-600/30 border-indigo-500'
                          : 'bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-700 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 italic">
                  {academicLevel === "Bachelor's" && '• Clear, foundational, accessible language & direct practical application'}
                  {academicLevel === "Master's" && '• Analytical, structured, research-aware language & empirical frameworks'}
                  {academicLevel === 'PhD' && '• Advanced, scholarly, gap-focused, methodology-rich & epistemological depth'}
                </p>
              </div>

              {/* STEP 2: Proposal Type */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  STEP 2 — What type of proposal would you like to write? <span className="text-indigo-400">*</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(['Education Proposal', 'Business Proposal', 'Social Media Proposal'] as AcademicProposalType[]).map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setAcademicType(pt)}
                      className={`text-xs py-2 px-3 rounded-xl border text-left transition flex items-center justify-between ${
                        academicType === pt
                          ? 'bg-slate-800 text-indigo-400 border-indigo-500 font-semibold ring-1 ring-indigo-500/50'
                          : 'bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{pt}</span>
                      {academicType === pt && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: Gather Details */}
              <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">STEP 3 — Gather Details</span>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Topic / Idea <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={academicTopic}
                    onChange={(e) => setAcademicTopic(e.target.value)}
                    placeholder="e.g. Gamified Mobile Microlearning in STEM Education"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Purpose / Objective <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={academicPurpose}
                    onChange={(e) => setAcademicPurpose(e.target.value)}
                    placeholder="e.g. Evaluate whether mobile problem sets increase conceptual recall compared to worksheets"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={academicAudience}
                    onChange={(e) => setAcademicAudience(e.target.value)}
                    placeholder="e.g. Academic Faculty Review Committee / Enterprise Stakeholders"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Specific Requirements / Guidelines</label>
                  <input
                    type="text"
                    value={academicRequirements}
                    onChange={(e) => setAcademicRequirements(e.target.value)}
                    placeholder="e.g. APA 7th edition, 4-month pilot scope"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* STEP 4: Generate Academic Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerateAcademic}
                  disabled={academicLoading || !academicTopic.trim() || !academicPurpose.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 hover:from-indigo-500 hover:to-purple-500 text-slate-900 dark:text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {academicLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing 7 academic sections...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Write 7-Section Academic Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Academic Output (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {!academicResult && !academicLoading && (
              <div className="bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
                  <GraduationCap className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">No academic proposal generated yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
                  Select your academic level and proposal type, then fill in details to generate a comprehensive 7-section structured proposal.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => loadAcademicPreset('1')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    Bachelor's Demo
                  </button>
                  <button
                    onClick={() => loadAcademicPreset('2')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    Master's Demo
                  </button>
                  <button
                    onClick={() => loadAcademicPreset('3')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                  >
                    PhD Demo
                  </button>
                </div>
              </div>
            )}

            {academicLoading && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-2/3" />
                <div className="h-20 bg-slate-800/60 rounded" />
                <div className="h-24 bg-slate-800/60 rounded" />
                <div className="h-32 bg-slate-800/60 rounded" />
              </div>
            )}

            {academicResult && (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {academicResult.academic_level}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {academicResult.proposal_type}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">{academicResult.title}</h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={copyAcademicMarkdown}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                      >
                        {academicCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{academicCopied ? 'Copied!' : 'Copy Markdown'}</span>
                      </button>
                      <button
                        onClick={downloadAcademicMarkdown}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .md</span>
                      </button>
                    </div>
                  </div>

                  {/* Calibration Insights description */}
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span>{academicResult.level_insights}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">{academicResult.word_count} words</span>
                  </div>
                </div>

                {/* 7 Section Cards */}
                {/* 1. Title */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400">1. Title</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{academicResult.title}</p>
                </div>

                {/* 2. Introduction / Background */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400">2. Introduction / Background</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{academicResult.introduction_background}</p>
                </div>

                {/* 3. Problem Statement */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400">3. Problem Statement</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{academicResult.problem_statement}</p>
                </div>

                {/* 4. Objectives */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400">4. Objectives</span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {academicResult.objectives.map((obj, i) => (
                      <li key={i} className="leading-relaxed">{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* 5. Methodology or Approach */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400">5. Methodology or Approach</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{academicResult.methodology_approach}</p>
                </div>

                {/* 6. Expected Outcomes / Benefits */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400">6. Expected Outcomes / Benefits</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{academicResult.expected_outcomes_benefits}</p>
                </div>

                {/* 7. Conclusion */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow space-y-1.5">
                  <span className="text-xs font-bold text-indigo-400">7. Conclusion</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{academicResult.conclusion}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
