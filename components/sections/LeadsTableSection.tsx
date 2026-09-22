import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Globe, 
  Smartphone, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Check,
  CheckSquare,
  Square,
  RefreshCw
} from 'lucide-react';
import { Lead, FilterOptions } from '@/lib/types';
import { STATUS_COLORS, WEBSITE_STATUS_BADGES, COUNTRIES_AND_CITIES, INDUSTRIES } from '@/lib/constants';

interface LeadsTableSectionProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateStatus: (id: string, newStatus: any) => Promise<void>;
  onExportCsv: (selectedIds?: string[]) => void;
  onCreateProposal?: (lead: Lead) => void;
  isLoading: boolean;
}

export const LeadsTableSection: React.FC<LeadsTableSectionProps> = ({
  leads,
  onOpenLead,
  onUpdateStatus,
  onExportCsv,
  onCreateProposal,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedWebsiteStatus, setSelectedWebsiteStatus] = useState('all');
  const [selectedAppStatus, setSelectedAppStatus] = useState('all');
  const [selectedLeadStatus, setSelectedLeadStatus] = useState('all');
  const [minScore, setMinScore] = useState<number>(0);

  // Sorting
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'name' | 'date'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter pipeline
  const filteredLeads = leads.filter((lead) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = lead.business_name.toLowerCase().includes(q);
      const matchCity = lead.city.toLowerCase().includes(q);
      const matchTags = lead.tags && lead.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchTags) return false;
    }

    if (selectedCountry !== 'all' && lead.country !== selectedCountry) return false;
    if (selectedIndustry !== 'all' && lead.industry !== selectedIndustry) return false;
    if (selectedWebsiteStatus !== 'all' && lead.website_status !== selectedWebsiteStatus) return false;
    if (selectedAppStatus !== 'all') {
      const wantApp = selectedAppStatus === 'true';
      if (lead.has_app !== wantApp) return false;
    }
    if (selectedLeadStatus !== 'all' && lead.lead_status !== selectedLeadStatus) return false;
    if (lead.pitch_score < minScore) return false;

    return true;
  });

  // Sorting pipeline
  filteredLeads.sort((a, b) => {
    let diff = 0;
    if (sortBy === 'score') diff = a.pitch_score - b.pitch_score;
    else if (sortBy === 'rating') diff = (a.google_rating || 0) - (b.google_rating || 0);
    else if (sortBy === 'name') diff = a.business_name.localeCompare(b.business_name);
    else diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortDir === 'asc' ? diff : -diff;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (column: 'score' | 'rating' | 'name' | 'date') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === paginatedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(paginatedLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(item => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="p-5 rounded-2xl bg-card border border-border-default backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by business name, city, tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-page border border-border-default rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Action buttons: Export & Bulk Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {selectedLeadIds.length > 0 && (
              <span className="text-xs text-text-secondary font-medium">
                {selectedLeadIds.length} selected
              </span>
            )}
            <button
              onClick={() => onExportCsv(selectedLeadIds.length > 0 ? selectedLeadIds : undefined)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-border-default text-xs font-semibold text-text-primary transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-brand-primary" />
              <span>{selectedLeadIds.length > 0 ? `Export (${selectedLeadIds.length}) CSV` : 'Export All to CSV'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Faceted Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-border-default">
          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => { setSelectedCountry(e.target.value); setCurrentPage(1); }}
            className="bg-page border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Countries</option>
            {Object.keys(COUNTRIES_AND_CITIES).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }}
            className="bg-page border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Industries</option>
            {INDUSTRIES.filter(i => i !== 'All').map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          {/* Website Status Filter */}
          <select
            value={selectedWebsiteStatus}
            onChange={(e) => { setSelectedWebsiteStatus(e.target.value); setCurrentPage(1); }}
            className="bg-page border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Website Status</option>
            <option value="no_website">No Website Only</option>
            <option value="outdated">Outdated Website</option>
            <option value="active">Has Active Website</option>
          </select>


          {/* Lead Funnel Status */}
          <select
            value={selectedLeadStatus}
            onChange={(e) => { setSelectedLeadStatus(e.target.value); setCurrentPage(1); }}
            className="bg-page border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Lead Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          {/* Min Score Filter */}
          <select
            value={minScore}
            onChange={(e) => { setMinScore(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-page border border-border-default rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-blue-500"
          >
            <option value={0}>Any Score</option>
            <option value={5}>Score &gt;= 5</option>
            <option value={7}>Score &gt;= 7 (Prime)</option>
            <option value={9}>Score &gt;= 9 (Urgent)</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="rounded-2xl bg-card border border-border-default backdrop-blur-md shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-page text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <th className="p-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-text-secondary hover:text-text-primary">
                    {selectedLeadIds.length === paginatedLeads.length && paginatedLeads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-brand-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th 
                  onClick={() => toggleSort('name')}
                  className="p-4 cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Business Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4">Location</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Website</th>
                <th className="p-4">Best Service to Pitch</th>
                <th 
                  onClick={() => toggleSort('score')}
                  className="p-4 cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Pitch Score</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </div>
                </th>
                <th className="p-4">Status</th>
                <th 
                  onClick={() => toggleSort('date')}
                  className="p-4 cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Found</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-secondary">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-brand-primary" />
                      <span>Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-secondary">
                    No leads found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const statusCfg = STATUS_COLORS[lead.lead_status] || STATUS_COLORS.new;
                  const webBadge = WEBSITE_STATUS_BADGES[lead.website_status] || WEBSITE_STATUS_BADGES.no_website;
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onOpenLead(lead)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-900/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center" onClick={(e) => toggleSelectLead(lead.id, e)}>
                        <button className="text-slate-500 hover:text-text-primary">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Business Name & Phone */}
                      <td className="p-4 font-medium text-text-primary group-hover:text-brand-primary transition-colors">
                        <div>{lead.business_name}</div>
                        {lead.phone && (
                          <div className="text-[11px] text-text-secondary font-normal mt-0.5">{lead.phone}</div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="p-4 text-text-primary">
                        <div>{lead.city}</div>
                        <div className="text-[11px] text-text-secondary">{lead.country}</div>
                      </td>

                      {/* Industry */}
                      <td className="p-4 text-text-primary">
                        <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-border-default text-[11px]">
                          {lead.industry}
                        </span>
                      </td>

                      {/* Website */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${webBadge.bg} ${webBadge.text}`}>
                          {webBadge.label}
                        </span>
                      </td>

                      {/* Best Service to Pitch */}
                      <td className="p-4">
                        <span className="text-[11px] text-blue-300 font-medium">
                          {lead.best_service_to_pitch}
                        </span>
                      </td>

                      {/* Pitch Score */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-page border border-border-default flex items-center justify-center font-black text-sm text-amber-400 shadow-inner">
                            {lead.pitch_score}/10
                          </div>
                          <div className="text-[10px] text-text-secondary">
                            {lead.pitch_score >= 8 ? (
                              <span className="text-amber-400 font-bold block">Prime Deal</span>
                            ) : lead.pitch_score >= 5 ? (
                              <span className="text-brand-primary font-medium block">High Upside</span>
                            ) : (
                              <span className="text-text-secondary block">Moderate</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.lead_status}
                          onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          <option value="new" className="bg-card text-text-primary">New</option>
                          <option value="contacted" className="bg-card text-text-primary">Contacted</option>
                          <option value="proposal_sent" className="bg-card text-text-primary">Proposal Sent</option>
                          <option value="won" className="bg-card text-text-primary">Won</option>
                          <option value="lost" className="bg-card text-text-primary">Lost</option>
                        </select>
                      </td>

                      {/* Date Found */}
                      <td className="p-4 text-text-secondary text-[11px] whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => onCreateProposal && onCreateProposal(lead)}
                          className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          Create Proposal
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border-default bg-page flex items-center justify-between text-xs text-text-secondary">
          <div>
            Showing <span className="text-text-primary font-semibold">{filteredLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="text-text-primary font-semibold">
              {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
            </span>{' '}
            of <span className="text-text-primary font-semibold">{filteredLeads.length}</span> leads
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-text-primary font-medium transition-colors"
            >
              Previous
            </button>
            <span className="px-2 text-text-secondary font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-text-primary font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
