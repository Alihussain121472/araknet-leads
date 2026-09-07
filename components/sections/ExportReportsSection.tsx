import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  PieChart, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Percent,
  Sparkles
} from 'lucide-react';
import { Lead, DashboardStats } from '@/lib/types';

interface ExportReportsSectionProps {
  leads: Lead[];
  stats: DashboardStats;
  onExportCsv: () => void;
}

export const ExportReportsSection: React.FC<ExportReportsSectionProps> = ({
  leads,
  stats,
  onExportCsv,
}) => {
  const [exporting, setExporting] = useState(false);

  // Group leads by City
  const cityCounts = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.city] = (acc[lead.city] || 0) + 1;
    return acc;
  }, {});

  // Group leads by Industry
  const industryCounts = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.industry] = (acc[lead.industry] || 0) + 1;
    return acc;
  }, {});

  // Group leads by Website Status
  const websiteStatusCounts = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.website_status] = (acc[lead.website_status] || 0) + 1;
    return acc;
  }, {});

  const handleDownloadCsv = () => {
    setExporting(true);
    onExportCsv();
    setTimeout(() => setExporting(false), 800);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `leads_dataset_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      {/* Top Export Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-950 border border-blue-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            Lead Dataset Export & Downloads
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Download your discovered businesses, digital audit scores, contact numbers, and sales pitch angles formatted for direct import into your CRM, email sequencers, or cold-calling dialers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV ({leads.length} Leads)</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Raw JSON</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* City Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Leads by Target City
            </h4>
            <span className="text-[11px] text-slate-500">{Object.keys(cityCounts).length} markets</span>
          </div>

          <div className="space-y-3">
            {Object.entries(cityCounts).map(([city, count]) => {
              const pct = Math.round((count / (leads.length || 1)) * 100);
              return (
                <div key={city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{city}</span>
                    <span className="text-slate-400">{count} leads ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Leads by Vertical Market
            </h4>
            <span className="text-[11px] text-slate-500">{Object.keys(industryCounts).length} verticals</span>
          </div>

          <div className="space-y-3">
            {Object.entries(industryCounts).map(([ind, count]) => {
              const pct = Math.round((count / (leads.length || 1)) * 100);
              return (
                <div key={ind} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate">{ind}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Deficiencies Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Digital Deficiencies
            </h4>
            <span className="text-[11px] text-slate-500">Service Pitch Fit</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-400">Zero Website Presence</p>
                <p className="text-[10px] text-slate-400">Need full site & portal</p>
              </div>
              <div className="text-lg font-black text-rose-400">
                {websiteStatusCounts['no_website'] || 0}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-400">Outdated / Insecure Sites</p>
                <p className="text-[10px] text-slate-400">High mobile bounce rates</p>
              </div>
              <div className="text-lg font-black text-amber-400">
                {websiteStatusCounts['outdated'] || 0}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-400">Deals Closed / Won</p>
                <p className="text-[10px] text-slate-400">{stats.conversionRate}% overall win rate</p>
              </div>
              <div className="text-lg font-black text-emerald-400">
                {stats.dealsWon}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
