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
} from 'lucide-react';
import { Platform, Tone, ProposalInput, ProposalResponse } from '@/lib/proposal-agent/types';
import { PRESETS } from '@/lib/proposal-agent/presets';
import { Lead } from '@/lib/types';

interface ProposalAgentSectionProps {
  leads?: Lead[];
}

export const ProposalAgentSection: React.FC<ProposalAgentSectionProps> = ({ leads = [] }) => {
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

  const [provider, setProvider] = useState<'offline' | 'gemini' | 'groq' | 'openai'>('offline');
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

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

  // Check red flags whenever job description changes
  useEffect(() => {
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
  }, [jobDescription, budgetRange]);

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

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Proposal Strategist Agent</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                $2M+ Win Rate Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Clients do not hire the most qualified freelancer—they hire who makes them feel most understood and confident.
              Generates two psychologically calibrated variations with live red-flag detection and coaching notes.
            </p>
          </div>

          {/* Quick Presets and Settings */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadPreset('1')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>SaaS Preset</span>
            </button>
            <button
              onClick={() => loadPreset('3')}
              className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Red Flag Demo</span>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Configure Strategy Engine"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strategy Engine Settings Bar (collapsible) */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Strategy Engine</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="offline">Araknet Strategic Engine (Offline - No API Key Needed)</option>
                <option value="gemini">Google Gemini (Gemini 2.5 Flash / 1.5 Pro)</option>
                <option value="groq">Groq (Llama 3.3 70B Versatile - Ultra Fast)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              </select>
            </div>
            {provider !== 'offline' && (
              <div>
                <label className="block text-slate-400 font-medium mb-1">{provider.toUpperCase()} API Key (Optional)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Defaults to server environment variable if empty"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Form Inputs (5 cols) & Output (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            {/* Header with Lead Importer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
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

            {/* 1. Platform Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400">1. Target Platform</label>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                  Target: {platformLengths[platform]}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Upwork', 'Direct Email', 'LinkedIn', 'Agency RFP'] as Platform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`text-xs py-2 px-2 rounded-xl border transition text-center font-medium truncate ${
                      platform === p
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tone Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">2. Tone of Voice</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Professional', 'Friendly', 'Direct', 'Consultative'] as Tone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`text-xs py-1.5 px-2 rounded-xl border transition text-center truncate ${
                      tone === t
                        ? 'bg-slate-700 text-white border-slate-500 font-medium shadow-sm'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border-slate-700/80'
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
                <label className="text-xs font-medium text-slate-300">
                  3. Client Job Post / Project Brief <span className="text-blue-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">{jobDescription.length} chars</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                placeholder="Paste the full job post, RFP requirements, or prospect website notes..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-y"
              />
            </div>

            {/* Live Red Flag Banner */}
            {liveRedFlag && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold">Risk Detected: </span>
                  <span>{liveRedFlag}</span>
                </div>
              </div>
            )}

            {/* 4. Freelancer Profile & Relevant Experience */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  4. Your Profile / Agency Niche
                </label>
                <input
                  type="text"
                  value={freelancerProfile}
                  onChange={(e) => setFreelancerProfile(e.target.value)}
                  placeholder="e.g. Senior Full-Stack & AI Systems Engineer"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  5. Most Relevant Project for THIS Client
                </label>
                <textarea
                  rows={2}
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  placeholder="What past project directly proves you solve their specific pain?"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>
            </div>

            {/* 6. Proposed Approach */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                6. Proposed Technical Approach & Workflow
              </label>
              <textarea
                rows={2}
                value={proposedApproach}
                onChange={(e) => setProposedApproach(e.target.value)}
                placeholder="Specific frameworks, architecture, and what you do differently from average bidders"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>

            {/* 7 & 8: Budget & Achievements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">7. Budget Range / Rate</label>
                <input
                  type="text"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  placeholder="e.g. $4,000 - $6,000"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">8. Quantifiable Proof / Metrics</label>
                <input
                  type="text"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="e.g. Slashed load time by 60%"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !jobDescription.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
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

        {/* RIGHT COLUMN: Strategic Outputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Empty Placeholder */}
          {!result && !loading && (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <Sparkles className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">No proposal generated yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-5">
                Paste a client job brief on the left, or choose a lead from your Araknet directory to instantly craft calibrated variations.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => loadPreset('1')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  Load Next.js AI Preset
                </button>
                <button
                  onClick={() => loadPreset('2')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  Load E-Commerce CRO Preset
                </button>
                <button
                  onClick={() => loadPreset('4')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  Load Agency RFP Preset
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-800 rounded w-1/3" />
              <div className="h-28 bg-slate-800/60 rounded" />
              <div className="h-28 bg-slate-800/60 rounded" />
              <div className="h-24 bg-slate-800/40 rounded" />
            </div>
          )}

          {/* Actual Results */}
          {result && !loading && (
            <div className="space-y-5">
              {/* RED FLAG ALERT BANNER */}
              {result.red_flag_alert && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs shadow-lg shadow-red-950/20">
                  <div className="flex items-center gap-2 font-bold text-red-400 mb-1">
                    <Flag className="w-4 h-4 text-red-500" />
                    <span>🚩 RED FLAG ALERT</span>
                  </div>
                  <p className="text-red-200/90 leading-relaxed">{result.red_flag_alert}</p>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Dual Strategic Variations
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {result.provider_used}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(result.raw_formatted, 'full')}
                    className="text-xs px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFull ? 'Copied!' : 'Copy All'}</span>
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="text-xs px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .md</span>
                  </button>
                </div>
              </div>

              {/* VARIATION A CARD */}
              <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      VARIATION A
                    </span>
                    <span className="text-xs text-slate-300 font-medium truncate">{result.variation_a.angle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{result.variation_a.word_count} words</span>
                    <button
                      onClick={() => copyToClipboard(result.variation_a.text, 'a')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
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

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {result.variation_a.text}
                </div>
              </div>

              {/* VARIATION B CARD */}
              <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      VARIATION B
                    </span>
                    <span className="text-xs text-slate-300 font-medium truncate">{result.variation_b.angle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{result.variation_b.word_count} words</span>
                    <button
                      onClick={() => copyToClipboard(result.variation_b.text, 'b')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
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

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {result.variation_b.text}
                </div>
              </div>

              {/* COACHING NOTE CARD */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                    <BarChart2 className="w-4 h-4" /> 📊 STRATEGIC COACHING NOTE
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Recommended: {result.coaching_note.stronger_variation}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="font-semibold text-slate-200 block mb-1">🎯 Stronger Variation Rationale</span>
                    <p className="text-slate-400">{result.coaching_note.stronger_reason}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="font-semibold text-slate-200 block mb-1">✍️ What to Personalize Before Sending</span>
                    <p className="text-slate-400">{result.coaching_note.what_to_personalize}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="font-semibold text-slate-200 block mb-1">💡 Smart Question to Add</span>
                    <p className="text-slate-400 italic">&ldquo;{result.coaching_note.smart_question}&rdquo;</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="font-semibold text-slate-200 block mb-1">🏆 Win Probability Factors</span>
                    <p className="text-slate-400">{result.coaching_note.win_probability_factors}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
