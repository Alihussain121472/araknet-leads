'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Zap, Sparkles, Copy, Check, Download, 
  Briefcase, Save, Edit3, Trash2, Clock, RefreshCw
} from 'lucide-react';
import { Platform, Tone, ProposalResponse } from '@/lib/proposal-agent/types';
import { Lead, FreelancerProfile, SavedProposal } from '@/lib/types';

interface ProposalAgentSectionProps {
  leads?: Lead[];
  selectedLeadForProposal?: Lead | null;
}

export const ProposalAgentSection: React.FC<ProposalAgentSectionProps> = ({ 
  leads = [], 
  selectedLeadForProposal 
}) => {
  // Profile State
  const [freelancerProfile, setFreelancerProfile] = useState<string>('');
  const [relevantExperience, setRelevantExperience] = useState<string>('');
  const [proposedApproach, setProposedApproach] = useState<string>('');
  const [tone, setTone] = useState<Tone>('Direct');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Proposal Input State
  const [jobDescription, setJobDescription] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('');
  const [achievements, setAchievements] = useState<string>('');
  const [isStructured, setIsStructured] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Engine State
  const [loading, setLoading] = useState<boolean>(false);
  const [draftContent, setDraftContent] = useState<string>('');
  const [copiedFull, setCopiedFull] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null);

  // Saved Proposals
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);

  // Fetch Profile & Proposals on mount
  useEffect(() => {
    fetchProfile();
    fetchProposals();
  }, []);

  // Pre-load lead if passed
  useEffect(() => {
    if (selectedLeadForProposal) {
      importFromLead(selectedLeadForProposal);
    }
  }, [selectedLeadForProposal]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setFreelancerProfile(data.profile.freelancer_profile || '');
          setRelevantExperience(data.profile.relevant_experience || '');
          setProposedApproach(data.profile.proposed_approach || '');
          setTone((data.profile.tone as Tone) || 'Professional');
        }
      }
    } catch (e) {
      console.error('Error fetching profile', e);
    }
  };

  const fetchProposals = async () => {
    setIsLoadingProposals(true);
    try {
      const res = await fetch('/api/proposals');
      if (res.ok) {
        const data = await res.json();
        setSavedProposals(data.proposals || []);
      }
    } catch (e) {
      console.error('Error fetching proposals', e);
    } finally {
      setIsLoadingProposals(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancer_profile: freelancerProfile,
          relevant_experience: relevantExperience,
          proposed_approach: proposedApproach,
          tone
        })
      });
      alert('Profile saved successfully as default for future proposals.');
    } catch (e) {
      alert('Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const importFromLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    const websiteStatus = lead.website_url ? `Their website is ${lead.website_url}.` : 'They do not currently have an active website.';
    const suggestions = lead.suggested_services?.join(', ') || 'digital presence and web modernization';
    
    setJobDescription(
      `Direct Outreach Pitch for ${lead.business_name} (${lead.industry || 'Local Business'}, located in ${lead.city}, ${lead.country}). ` +
      `${websiteStatus} Identified opportunity: ${suggestions}. Goal is to pitch modernization, conversion optimization, and automated lead handling.`
    );
    // Profile inputs intentionally left as is (use global profile)
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setActiveProposalId(null);

    try {
      const payload = {
        platform: 'Direct Email',
        tone,
        job_description: jobDescription,
        freelancer_profile: freelancerProfile,
        relevant_experience: relevantExperience,
        proposed_approach: proposedApproach,
        budget_range: budgetRange,
        achievements,
        is_structured: isStructured,
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
      setDraftContent(data.draft);
    } catch (err) {
      alert('Error generating proposal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draftContent) return;
    setIsSavingDraft(true);
    try {
      const selectedLead = leads.find(l => l.id === selectedLeadId);
      const payload = {
        lead_id: selectedLeadId || undefined,
        business_name: selectedLead ? selectedLead.business_name : 'Unknown Business',
        content: draftContent,
        is_structured: isStructured
      };
      
      let res;
      if (activeProposalId) {
        res = await fetch(`/api/proposals/${activeProposalId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: draftContent })
        });
      } else {
        res = await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        setActiveProposalId(data.proposal.id);
        fetchProposals();
        alert('Draft saved successfully!');
      }
    } catch (e) {
      alert('Error saving draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const loadSavedProposal = (prop: SavedProposal) => {
    setActiveProposalId(prop.id);
    setDraftContent(prop.content);
    setIsStructured(prop.is_structured);
    if (prop.lead_id) {
      setSelectedLeadId(prop.lead_id);
    }
  };

  const deleteSavedProposal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this saved proposal?')) return;
    try {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      if (activeProposalId === id) {
        setActiveProposalId(null);
        setDraftContent('');
      }
      fetchProposals();
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftContent).then(() => {
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border-default rounded-2xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-brand-link">
            <Briefcase className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Proposal Editor
          </h2>
        </div>
        <p className="text-sm text-text-secondary max-w-2xl">
          Generate strong, customized outreach messages or structured proposals. Save your base profile to generate better drafts automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Inputs & Profile */}
        <div className="lg:col-span-5 space-y-6">
          {/* Base Profile Section */}
          <div className="bg-card border border-border-default rounded-2xl p-5 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <span className="text-sm font-semibold text-text-primary">
                My Freelancer Profile
              </span>
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-hover hover:bg-page text-text-primary transition"
              >
                {isSavingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save as Default
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Services & Niche</label>
              <input
                type="text"
                value={freelancerProfile}
                onChange={(e) => setFreelancerProfile(e.target.value)}
                placeholder="e.g. Senior Web Consultant"
                className="form-control w-full rounded-xl px-3 py-2 text-xs text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Standard Approach / Tech Stack</label>
              <textarea
                rows={2}
                value={proposedApproach}
                onChange={(e) => setProposedApproach(e.target.value)}
                className="form-control w-full rounded-xl px-3 py-2 text-xs text-text-primary resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Key Experience & Proof</label>
              <textarea
                rows={2}
                value={relevantExperience}
                onChange={(e) => setRelevantExperience(e.target.value)}
                className="form-control w-full rounded-xl px-3 py-2 text-xs text-text-primary resize-y"
              />
            </div>
          </div>

          {/* Project Details Section */}
          <div className="bg-card border border-border-default rounded-2xl p-5 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <span className="text-sm font-semibold text-text-primary">
                Project Details
              </span>
              {leads.length > 0 && (
                <select
                  value={selectedLeadId}
                  onChange={(e) => {
                    const l = leads.find(x => x.id === e.target.value);
                    if (l) importFromLead(l);
                  }}
                  className="form-control text-xs rounded-lg px-2 py-1 max-w-[150px] truncate"
                >
                  <option value="">Select a Lead...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.business_name}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">Client Brief or Job Post <span className="text-accent-rose">*</span></label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste what the client needs or select a lead above..."
                className="form-control w-full rounded-xl px-3 py-2 text-xs text-text-primary resize-y"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-text-primary">
                <input 
                  type="checkbox" 
                  checked={isStructured} 
                  onChange={(e) => setIsStructured(e.target.checked)}
                  className="rounded border-border-default bg-slate-50 dark:bg-slate-900"
                />
                Structured Service Proposal (Scope, Timeline, Pricing)
              </label>
            </div>

            {isStructured && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Budget / Pricing</label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g. $4,000"
                    className="form-control w-full rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription.trim()}
              className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate Draft
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output & Saved */}
        <div className="lg:col-span-7 space-y-5">
          {/* Editor Card */}
          <div className="bg-card border border-border-default rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-4 border-b border-border-default mb-4">
              <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-link" />
                {activeProposalId ? 'Editing Saved Draft' : 'New Draft'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!draftContent}
                  className="text-xs px-3 py-1.5 rounded-lg bg-card-hover hover:bg-page text-text-primary transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {copiedFull ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={!draftContent || isSavingDraft}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingDraft ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Draft
                </button>
              </div>
            </div>
            
            {draftContent || loading ? (
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                disabled={loading}
                className="flex-grow form-control w-full rounded-xl px-4 py-4 text-sm text-text-primary placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans resize-none disabled:opacity-60"
                placeholder="Your draft will appear here..."
              />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-text-muted text-center">
                <Sparkles className="w-10 h-10 mb-4 opacity-20" />
                <p>No draft yet. Generate a new one or select a saved proposal below.</p>
              </div>
            )}
          </div>

          {/* Saved Proposals List */}
          <div className="bg-card border border-border-default rounded-2xl p-5 shadow-sm dark:shadow-xl">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-amber" /> Saved Proposals
            </h3>
            
            {isLoadingProposals ? (
              <div className="text-xs text-text-muted py-4 text-center">Loading...</div>
            ) : savedProposals.length === 0 ? (
              <div className="text-xs text-text-muted py-4 text-center">No saved proposals yet.</div>
            ) : (
              <div className="grid gap-3">
                {savedProposals.map(prop => (
                  <div 
                    key={prop.id} 
                    onClick={() => loadSavedProposal(prop)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                      activeProposalId === prop.id 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : 'border-border-default bg-page hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-text-primary mb-1">
                        {prop.business_name || 'Unknown Client'}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-2">
                        <span>{new Date(prop.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded">{prop.is_structured ? 'Structured' : 'Outreach'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteSavedProposal(prop.id, e)}
                      className="text-text-muted hover:text-accent-rose transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
