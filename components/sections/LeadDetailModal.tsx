import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Plus, 
  Send, 
  Smartphone, 
  FileText,
  Star,
  Trash2
} from 'lucide-react';
import { Lead, LeadNote, LeadActivity } from '@/lib/types';
import { STATUS_COLORS, WEBSITE_STATUS_BADGES } from '@/lib/constants';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: any) => Promise<void>;
  onUpdateTags: (id: string, tags: string[]) => Promise<void>;
  onAddNote: (leadId: string, content: string) => Promise<LeadNote | null>;
  onDeleteLead: (id: string) => Promise<void>;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onUpdateTags,
  onAddNote,
  onDeleteLead,
}) => {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Fetch full details & notes when modal opens
  useEffect(() => {
    if (!lead) return;
    let active = true;
    setNotes([]); setActivities([]); setNewNoteContent('');
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/leads/${lead.id}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.notes) setNotes(data.notes);
          if (active && data.activities) setActivities(data.activities);
        }
      } catch (err) {
        console.warn('Failed to load full lead details', err);
      }
    };
    fetchDetails();
    return () => { active = false; };
  }, [lead]);

  if (!lead) return null;

  const statusCfg = STATUS_COLORS[lead.lead_status] || STATUS_COLORS.new;
  const webBadge = WEBSITE_STATUS_BADGES[lead.website_status] || WEBSITE_STATUS_BADGES.no_website;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);
    const added = await onAddNote(lead.id, newNoteContent.trim());
    if (added) {
      setNotes([added, ...notes]);
      setNewNoteContent('');
    }
    setIsSubmittingNote(false);
  };

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toLowerCase();
    if (!lead.tags.includes(cleanTag)) {
      const updatedTags = [...lead.tags, cleanTag];
      await onUpdateTags(lead.id, updatedTags);

    }
    setNewTagInput('');
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = lead.tags.filter(t => t !== tagToRemove);
    await onUpdateTags(lead.id, updatedTags);

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Slide-over Container */}
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-screen overflow-y-auto flex flex-col justify-between shadow-2xl">
        {/* Header Bar */}
        <div>
          <div className="p-6 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${webBadge.bg} ${webBadge.text}`}>
                  {webBadge.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{lead.business_name}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{lead.industry}</span>
                <span>•</span>
                <span>{lead.city}, {lead.country}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDeleteLead(lead.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Status Workflow Selector */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-slate-300">
                Pipeline Funnel Stage:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['new', 'contacted', 'proposal_sent', 'won', 'lost'] as const).map((stage) => {
                  const active = lead.lead_status === stage;
                  const cfg = STATUS_COLORS[stage];
                  return (
                    <button
                      key={stage}
                      onClick={() => onUpdateStatus(lead.id, stage)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        active
                          ? `${cfg.bg} ${cfg.text} border ${cfg.border} shadow-sm`
                          : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opportunity Score & Pitch Breakdown */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-inner">
                    {lead.opportunity_score}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Opportunity Assessment
                    </h3>
                    <p className="text-xs text-slate-400">
                      AI Automation Potential: <span className="text-cyan-400 font-semibold">{lead.ai_automation_potential}%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Opportunity Reason */}
              {lead.opportunity_reason && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 leading-relaxed italic">
                  &ldquo;{lead.opportunity_reason}&rdquo;
                </div>
              )}

              {/* Suggested Services to Offer */}
              {lead.suggested_services && lead.suggested_services.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Pitch Services</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.suggested_services.map((svc, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
                        ✦ {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact & Business Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Profiles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-xs font-semibold text-slate-200 hover:text-blue-400 truncate block">
                      {lead.phone || 'Not available'}
                    </a>
                  </div>
                </div>

                {/* Website */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400">Website</p>
                    {lead.website_url ? (
                      <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-400 hover:underline truncate flex items-center gap-1">
                        <span>{lead.website_url.replace(/https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-rose-400 font-medium">No Website Found</span>
                    )}
                  </div>
                </div>

                {/* Google Maps Link */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400">Maps & Street View</p>
                    {lead.google_maps_url ? (
                      <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-cyan-400 hover:underline truncate flex items-center gap-1">
                        <span>View map listing</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">{lead.address || 'Address pending'}</span>
                    )}
                  </div>
                </div>

                {/* Google Rating */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Google Reputation</p>
                    <p className="text-xs font-semibold text-slate-200">
                      {lead.google_rating ? `${lead.google_rating} / 5.0 (${lead.google_reviews_count} reviews)` : 'No ratings yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Manager */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}

                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-24"
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Personal Notes & Interaction History
              </h3>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Record phone call outcomes, proposal details, or follow-up notes..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteContent.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {notes.map((note) => (
                  <div key={note.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">{note.author}</span>
                      <span>{new Date(note.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Events */}
            <div className="space-y-3 pt-4 border-t border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Activity Timeline
              </h3>
              <div className="space-y-2">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/30">
                    <span className="text-slate-300">{act.description}</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
