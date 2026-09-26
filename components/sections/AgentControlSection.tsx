import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Terminal, 
  MapPin, 
  Building2, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { COUNTRIES_AND_CITIES, INDUSTRIES } from '@/lib/constants';
import { apiFetch } from '@/lib/api-client';
import { AgentRun, AgentLog, Lead } from '@/lib/types';

interface AgentControlSectionProps {
  agentRunning: boolean;
  onTriggerRun: (params: { country: string; city: string; industry: string; maxResults: number }) => Promise<void>;
  latestRun: AgentRun | null;
  logs: AgentLog[];
  newlyFetchedLeads?: Lead[];
}

export const AgentControlSection: React.FC<AgentControlSectionProps> = ({
  agentRunning,
  onTriggerRun,
  latestRun,
  logs,
  newlyFetchedLeads = [],
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [maxResults, setMaxResults] = useState<number>(8);
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly'>('daily');

  const [scheduleError, setScheduleError] = useState('');
  useEffect(() => { apiFetch('/api/settings').then(r=>r.json()).then(d=>{ if(d.settings){ setScheduleEnabled(d.settings.schedule_enabled); setScheduleFrequency(d.settings.schedule_frequency); setSelectedCountry(d.settings.schedule_country); setSelectedCity(d.settings.schedule_city); setSelectedIndustry(d.settings.schedule_industry); } }).catch(error => setScheduleError(error.message)); }, []);
  const saveSchedule = async (enabled: boolean, frequency: 'daily' | 'weekly') => {
    try {
      const res = await apiFetch('/api/settings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({schedule_enabled:enabled,schedule_frequency:frequency,schedule_country:selectedCountry,schedule_city:selectedCity,schedule_industry:selectedIndustry}) });
      if (!res.ok) throw new Error('Could not save schedule');
      setScheduleEnabled(enabled); setScheduleFrequency(frequency); setScheduleError('');
    } catch (error) { setScheduleError(error instanceof Error ? error.message : 'Schedule was not saved. Please retry.'); }
  };
  const availableCities = COUNTRIES_AND_CITIES[selectedCountry] || ['Custom City'];

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    const cities = COUNTRIES_AND_CITIES[country];
    if (cities && cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  };

  const handleRunNow = async () => {
    if (agentRunning) return;
    if (!selectedCountry.trim() || !selectedCity.trim()) {
      setScheduleError('Choose a target country and city before starting a search.');
      return;
    }
    setScheduleError('');
    await onTriggerRun({
      country: selectedCountry,
      city: selectedCity,
      industry: selectedIndustry,
      maxResults,
    });
  };

  return (
    <div className="space-y-8">
      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border-default backdrop-blur-md shadow-sm dark:shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-link" />
                Discovery Agent Controls
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Configure your target geographic territory and vertical market to trigger autonomous discovery.
              </p>
              {scheduleError && <p role="alert" className="mt-2 text-xs text-accent-rose">{scheduleError}</p>}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-link" />
                  Target Country
                </label>
                <input aria-label="Target Country" list="countries" value={selectedCountry} onChange={e=>handleCountryChange(e.target.value)} disabled={agentRunning} className="form-control w-full rounded-xl p-3" />
                <datalist id="countries">{Object.keys(COUNTRIES_AND_CITIES).map(c=><option key={c} value={c}/>)}</datalist>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-accent-cyan" />
                  Target City
                </label>
                <input aria-label="Target City" list="cities" value={selectedCity} onChange={e=>setSelectedCity(e.target.value)} disabled={agentRunning} className="form-control w-full rounded-xl p-3" />
                <datalist id="cities">{availableCities.map(c=><option key={c} value={c}/>)}</datalist>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-accent-indigo" />
                  Target Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  disabled={agentRunning}
                  className="form-control w-full rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-card text-text-primary">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Batch Count */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
                  Batch Size (Leads per Run)
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  disabled={agentRunning}
                  className="form-control w-full rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value={5} className="bg-card">5 Businesses</option>
                  <option value={8} className="bg-card">8 Businesses (Recommended)</option>
                  <option value={15} className="bg-card">15 Businesses</option>
                  <option value={20} className="bg-card">20 Businesses</option>
                </select>
              </div>
            </div>

            {/* Run Action & Status Indicator */}
            <div className="pt-4 border-t border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  agentRunning ? 'bg-amber-400 animate-ping' : latestRun?.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Agent Status: {agentRunning ? 'Active' : 'Idle'}
                  </p>
                  {latestRun?.leads_found_count !== undefined && (
                    <p className="text-[11px] text-text-secondary">
                      Last scan produced {latestRun.leads_found_count} leads in {latestRun.city} ({latestRun.run_duration_ms ? `${(latestRun.run_duration_ms / 1000).toFixed(1)}s` : 'fast'})
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleRunNow}
                disabled={agentRunning || !selectedCountry.trim() || !selectedCity.trim()}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-sm dark:shadow-xl transition-all ${
                  agentRunning || !selectedCountry.trim() || !selectedCity.trim()
                    ? 'bg-slate-100 dark:bg-slate-800 text-text-muted dark:text-text-muted cursor-not-allowed border border-slate-200 dark:border-slate-700'
                    : 'bg-brand-primary hover:bg-brand-hover shadow-blue-500/25 active:scale-95 text-white'
                }`}
              >
                {agentRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Agent Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Agent Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Removed Schedule Configuration Card (Unsupported in multi-tenant without user context) */}
        </div>

        {/* Right 1 Col: Live Activity Terminal / Console */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-cyan" />
              Live Agent Console
            </h4>
            <span className="text-[10px] text-text-muted font-mono">STDOUT / JSON</span>
          </div>

          <div className="h-[420px] rounded-2xl terminal-block p-4 font-mono text-xs overflow-y-auto space-y-2.5 shadow-inner">
            <div className="text-[11px] text-term-dim pb-2 border-b border-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-term-prompt" />
              <span>Real-time agent execution stream</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-term-dim text-center py-24 text-[11px]">
                Click &ldquo;Run Agent Now&rdquo; to start execution...
              </div>
            ) : (
              logs.map((log, i) => {
                let badgeColor = 'text-term-dim';
                if (log.level === 'info') badgeColor = 'text-term-prompt';
                if (log.level === 'success') badgeColor = 'text-emerald-400';
                if (log.level === 'warn') badgeColor = 'text-amber-400';
                if (log.level === 'error') badgeColor = 'text-rose-400';

                return (
                  <div key={i} className="leading-relaxed flex items-start gap-2">
                    <span className="text-term-dim select-none">[{log.time}]</span>
                    <span className={`uppercase text-[10px] font-bold ${badgeColor}`}>[{log.level}]</span>
                    <span className="text-term-dim break-words flex-1">{log.message}</span>
                  </div>
                );
              })
            )}

            {agentRunning && (
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse pt-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="text-[11px]">Agent inspecting place nodes...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newly Fetched Leads Table */}
      <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-amber" />
          <h3 className="text-lg font-bold text-text-primary">Fresh Opportunities Discovered</h3>
        </div>
        <div className="bg-card rounded-2xl border border-border-default shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-page border-b border-border-default">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Business / Owner</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Industry</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Service Pitch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border-default">
                {(!newlyFetchedLeads || newlyFetchedLeads.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-secondary text-sm">
                      No leads discovered yet. Click &quot;Run Agent Now&quot; above to find high-ticket clients!
                    </td>
                  </tr>
                ) : (
                  newlyFetchedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-text-primary">{lead.business_name}</div>
                        <div className="text-xs text-text-secondary mt-1">Owner: {lead.owner_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">
                        {lead.industry}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary space-y-1">
                        <div>{lead.email || 'No email found'}</div>
                        <div className="text-xs text-text-secondary">{lead.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-accent-amber text-xs font-bold border border-amber-500/20">
                            {lead.opportunity_score}/100
                          </span>
                          <span className="text-xs font-semibold text-cyan-500">{lead.best_service_to_pitch}</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-2 line-clamp-2 italic">
                          {lead.opportunity_reason}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
