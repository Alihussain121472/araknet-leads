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
      <div className="p-6 rounded-2xl discovery-banner border border-blue-500/20 shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Download className="w-5 h-5 text-brand-link" />
            Lead Dataset Export & Downloads
          </h3>
          <p className="text-xs text-text-secondary max-w-xl">
            Download your discovered businesses, digital audit scores, contact numbers, and sales pitch angles formatted for direct import into your CRM, email sequencers, or cold-calling dialers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs shadow-sm dark:shadow-lg shadow-blue-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV ({leads.length} Leads)</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card-hover hover:bg-page border border-border-default text-text-primary font-semibold text-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-accent-cyan" />
            <span>Raw JSON</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* City Breakdown */}
        <div className="p-6 rounded-2xl bg-card border border-border-default backdrop-blur-md shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-link" />
              Leads by Target City
            </h4>
            <span className="text-[11px] text-text-muted">{Object.keys(cityCounts).length} markets</span>
          </div>

          <div className="space-y-3">
            {Object.entries(cityCounts).map(([city, count]) => {
              const pct = Math.round((count / (leads.length || 1)) * 100);
              return (
                <div key={city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-primary font-medium">{city}</span>
                    <span className="text-text-secondary">{count} leads ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-card-hover overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="p-6 rounded-2xl bg-card border border-border-default backdrop-blur-md shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent-cyan" />
              Leads by Vertical Market
            </h4>
            <span className="text-[11px] text-text-muted">{Object.keys(industryCounts).length} verticals</span>
          </div>

          <div className="space-y-3">
            {Object.entries(industryCounts).map(([ind, count]) => {
              const pct = Math.round((count / (leads.length || 1)) * 100);
              return (
                <div key={ind} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-primary font-medium truncate">{ind}</span>
                    <span className="text-text-secondary">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-card-hover overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Deficiencies Breakdown */}
        <div className="p-6 rounded-2xl bg-card border border-border-default backdrop-blur-md shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-amber" />
              Digital Deficiencies
            </h4>
            <span className="text-[11px] text-text-muted">Service Pitch Fit</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-accent-rose">Zero Website Presence</p>
                <p className="text-[10px] text-text-secondary">Need full site & portal</p>
              </div>
              <div className="text-lg font-black text-accent-rose">
                {websiteStatusCounts['no_website'] || 0}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-accent-amber">Outdated / Insecure Sites</p>
                <p className="text-[10px] text-text-secondary">High mobile bounce rates</p>
              </div>
              <div className="text-lg font-black text-accent-amber">
                {websiteStatusCounts['outdated'] || 0}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-accent-emerald">Deals Closed / Won</p>
                <p className="text-[10px] text-text-secondary">{stats.conversionRate}% overall win rate</p>
              </div>
              <div className="text-lg font-black text-accent-emerald">
                {stats.dealsWon}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
