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
  const [selectedCountry, setSelectedCountry] = useState<string>('Pakistan');
  const [selectedCity, setSelectedCity] = useState<string>('Karachi');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Clinic & Healthcare');
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
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                AI Lead Targeting Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set your location and niche to let the AI automatically find high-ticket clients.
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Target Country
                </label>
                <input aria-label="Target Country" list="countries" value={selectedCountry} onChange={e=>handleCountryChange(e.target.value)} disabled={agentRunning} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3" />
                <datalist id="countries">{Object.keys(COUNTRIES_AND_CITIES).map(c=><option key={c} value={c}/>)}</datalist>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Target City
                </label>
                <input aria-label="Target City" list="cities" value={selectedCity} onChange={e=>setSelectedCity(e.target.value)} disabled={agentRunning} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3" />
                <datalist id="cities">{availableCities.map(c=><option key={c} value={c}/>)}</datalist>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Target Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  disabled={agentRunning}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Batch Count */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Batch Size (Leads per Run)
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  disabled={agentRunning}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value={5} className="bg-white dark:bg-slate-900">5 Businesses</option>
                  <option value={8} className="bg-white dark:bg-slate-900">8 Businesses (Recommended)</option>
                  <option value={15} className="bg-white dark:bg-slate-900">15 Businesses</option>
                  <option value={20} className="bg-white dark:bg-slate-900">20 Businesses</option>
                </select>
              </div>
            </div>

            {/* Run Action & Status Indicator */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  agentRunning ? 'bg-amber-400 animate-ping' : latestRun?.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Status: {agentRunning ? 'Scanning & Auditing...' : latestRun?.status === 'completed' ? 'Last Run Completed' : 'Idle'}
                  </p>
                  {latestRun?.leads_found_count !== undefined && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Last scan produced {latestRun.leads_found_count} leads in {latestRun.city} ({latestRun.run_duration_ms ? `${(latestRun.run_duration_ms / 1000).toFixed(1)}s` : 'fast'})
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleRunNow}
                disabled={agentRunning}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-900 dark:text-white shadow-xl transition-all ${
                  agentRunning
                    ? 'bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 active:scale-95'
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

          {scheduleError && <p role="alert" className="text-rose-400">{scheduleError}</p>}
          {/* Schedule Configuration Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automated Recurring Schedule</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Enable background cron runs to discover and audit new businesses automatically without manual intervention.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={scheduleFrequency}
                onChange={(e) => saveSchedule(scheduleEnabled, e.target.value as "daily" | "weekly")}
                disabled={!scheduleEnabled}
                className={`bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none ${
                  !scheduleEnabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="daily">Run Daily (09:00 UTC)</option>
                <option value="weekly">Run Weekly (Mondays)</option>
              </select>

              <button
                type="button"
                onClick={() => saveSchedule(!scheduleEnabled, scheduleFrequency)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  scheduleEnabled ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    scheduleEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Terminal / Console */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Agent Console
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">STDOUT / JSON</span>
          </div>

          <div className="h-[420px] rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-y-auto space-y-2.5 shadow-inner">
            <div className="text-[11px] text-slate-500 pb-2 border-b border-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Real-time agent execution stream</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-slate-600 text-center py-24 text-[11px]">
                Click &ldquo;Run Agent Now&rdquo; to start execution...
              </div>
            ) : (
              logs.map((log, i) => {
                let badgeColor = 'text-slate-500 dark:text-slate-400';
                if (log.level === 'info') badgeColor = 'text-blue-400';
                if (log.level === 'success') badgeColor = 'text-emerald-400';
                if (log.level === 'warn') badgeColor = 'text-amber-400';
                if (log.level === 'error') badgeColor = 'text-rose-400';

                return (
                  <div key={i} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-600 select-none">[{log.time}]</span>
                    <span className={`uppercase text-[10px] font-bold ${badgeColor}`}>[{log.level}]</span>
                    <span className="text-slate-400 break-words flex-1">{log.message}</span>
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
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fresh Opportunities Discovered</h3>
        </div>
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Business / Owner</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Industry</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Service Pitch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(!newlyFetchedLeads || newlyFetchedLeads.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No leads discovered yet. Click &quot;Run Agent Now&quot; above to find high-ticket clients!
                    </td>
                  </tr>
                ) : (
                  newlyFetchedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">{lead.business_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Owner: {lead.owner_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {lead.industry}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        <div>{lead.email || 'No email found'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{lead.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                            {lead.opportunity_score}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 italic">
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
