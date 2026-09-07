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
  isLoading: boolean;
}

export const LeadsTableSection: React.FC<LeadsTableSectionProps> = ({
  leads,
  onOpenLead,
  onUpdateStatus,
  onExportCsv,
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
    if (lead.opportunity_score < minScore) return false;

    return true;
  });

  // Sorting pipeline
  filteredLeads.sort((a, b) => {
    let diff = 0;
    if (sortBy === 'score') diff = a.opportunity_score - b.opportunity_score;
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
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by business name, city, tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Action buttons: Export & Bulk Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {selectedLeadIds.length > 0 && (
              <span className="text-xs text-slate-400 font-medium">
                {selectedLeadIds.length} selected
              </span>
            )}
            <button
              onClick={() => onExportCsv(selectedLeadIds.length > 0 ? selectedLeadIds : undefined)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>{selectedLeadIds.length > 0 ? `Export (${selectedLeadIds.length}) CSV` : 'Export All to CSV'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Faceted Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-800/60">
          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => { setSelectedCountry(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Website Status</option>
            <option value="no_website">No Website Only</option>
            <option value="outdated">Outdated Website</option>
            <option value="active">Has Active Website</option>
          </select>

          {/* App Filter */}
          <select
            value={selectedAppStatus}
            onChange={(e) => { setSelectedAppStatus(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">App: Any</option>
            <option value="false">No Mobile App</option>
            <option value="true">Has Mobile App</option>
          </select>

          {/* Lead Funnel Status */}
          <select
            value={selectedLeadStatus}
            onChange={(e) => { setSelectedLeadStatus(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value={0}>Any Score</option>
            <option value={70}>Score &gt; 70</option>
            <option value={85}>Score &gt; 85 (Prime)</option>
            <option value={90}>Score &gt; 90 (Urgent)</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedLeadIds.length === paginatedLeads.length && paginatedLeads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th 
                  onClick={() => toggleSort('name')}
                  className="p-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Business Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4">Location</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Website</th>
                <th className="p-4">App</th>
                <th 
                  onClick={() => toggleSort('score')}
                  className="p-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Opportunity Score</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </div>
                </th>
                <th className="p-4">Status</th>
                <th 
                  onClick={() => toggleSort('date')}
                  className="p-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Found</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
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
                        <button className="text-slate-500 hover:text-slate-300">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Business Name & Phone */}
                      <td className="p-4 font-medium text-slate-100 group-hover:text-blue-400 transition-colors">
                        <div>{lead.business_name}</div>
                        {lead.phone && (
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">{lead.phone}</div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="p-4 text-slate-300">
                        <div>{lead.city}</div>
                        <div className="text-[11px] text-slate-400">{lead.country}</div>
                      </td>

                      {/* Industry */}
                      <td className="p-4 text-slate-300">
                        <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px]">
                          {lead.industry}
                        </span>
                      </td>

                      {/* Website */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${webBadge.bg} ${webBadge.text}`}>
                          {webBadge.label}
                        </span>
                      </td>

                      {/* App */}
                      <td className="p-4">
                        {lead.has_app ? (
                          <span className="text-emerald-400 font-medium">Yes</span>
                        ) : (
                          <span className="text-slate-500">{lead.has_app === null ? "Unverified" : "No"}</span>
                        )}
                      </td>

                      {/* Opportunity Score */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-sm text-amber-400 shadow-inner">
                            {lead.opportunity_score}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {lead.opportunity_score >= 85 ? (
                              <span className="text-amber-400 font-bold block">Prime Deal</span>
                            ) : lead.opportunity_score >= 70 ? (
                              <span className="text-blue-400 font-medium block">High Upside</span>
                            ) : (
                              <span className="text-slate-400 block">Moderate</span>
                            )}
                            <span>{lead.ai_automation_potential}% Auto</span>
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
                          <option value="new" className="bg-slate-900 text-slate-200">New</option>
                          <option value="contacted" className="bg-slate-900 text-slate-200">Contacted</option>
                          <option value="proposal_sent" className="bg-slate-900 text-slate-200">Proposal Sent</option>
                          <option value="won" className="bg-slate-900 text-slate-200">Won</option>
                          <option value="lost" className="bg-slate-900 text-slate-200">Lost</option>
                        </select>
                      </td>

                      {/* Date Found */}
                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-slate-200 font-semibold">{filteredLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="text-slate-200 font-semibold">
              {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
            </span>{' '}
            of <span className="text-slate-200 font-semibold">{filteredLeads.length}</span> leads
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-medium"
            >
              Previous
            </button>
            <span className="px-2 text-slate-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
