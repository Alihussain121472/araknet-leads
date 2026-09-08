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
import { AgentRun, AgentLog } from '@/lib/types';

interface AgentControlSectionProps {
  agentRunning: boolean;
  onTriggerRun: (params: { country: string; city: string; industry: string; maxResults: number }) => Promise<void>;
  latestRun: AgentRun | null;
  logs: AgentLog[];
}

export const AgentControlSection: React.FC<AgentControlSectionProps> = ({
  agentRunning,
  onTriggerRun,
  latestRun,
  logs,
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
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                Discovery Agent Controls
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure your target geographic territory and vertical market to trigger autonomous discovery.
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Target Country
                </label>
                <input aria-label="Target Country" list="countries" value={selectedCountry} onChange={e=>handleCountryChange(e.target.value)} disabled={agentRunning} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3" />
                <datalist id="countries">{Object.keys(COUNTRIES_AND_CITIES).map(c=><option key={c} value={c}/>)}</datalist>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Target City
                </label>
                <input aria-label="Target City" list="cities" value={selectedCity} onChange={e=>setSelectedCity(e.target.value)} disabled={agentRunning} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3" />
                <datalist id="cities">{availableCities.map(c=><option key={c} value={c}/>)}</datalist>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Target Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  disabled={agentRunning}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-slate-900 text-slate-200">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Batch Count */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Batch Size (Leads per Run)
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  disabled={agentRunning}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value={5} className="bg-slate-900">5 Businesses</option>
                  <option value={8} className="bg-slate-900">8 Businesses (Recommended)</option>
                  <option value={15} className="bg-slate-900">15 Businesses</option>
                  <option value={20} className="bg-slate-900">20 Businesses</option>
                </select>
              </div>
            </div>

            {/* Run Action & Status Indicator */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  agentRunning ? 'bg-amber-400 animate-ping' : latestRun?.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Status: {agentRunning ? 'Scanning & Auditing...' : latestRun?.status === 'completed' ? 'Last Run Completed' : 'Idle'}
                  </p>
                  {latestRun?.leads_found_count !== undefined && (
                    <p className="text-[11px] text-slate-400">
                      Last scan produced {latestRun.leads_found_count} leads in {latestRun.city} ({latestRun.run_duration_ms ? `${(latestRun.run_duration_ms / 1000).toFixed(1)}s` : 'fast'})
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleRunNow}
                disabled={agentRunning}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-xl transition-all ${
                  agentRunning
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
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
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Automated Recurring Schedule</h4>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Enable background cron runs to discover and audit new businesses automatically without manual intervention.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={scheduleFrequency}
                onChange={(e) => saveSchedule(scheduleEnabled, e.target.value as "daily" | "weekly")}
                disabled={!scheduleEnabled}
                className={`bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none ${
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
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Agent Console
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">STDOUT / JSON</span>
          </div>

          <div className="h-[420px] rounded-2xl bg-slate-950 border border-slate-800/90 p-4 font-mono text-xs overflow-y-auto space-y-2.5 shadow-inner">
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
                let badgeColor = 'text-slate-400';
                if (log.level === 'info') badgeColor = 'text-blue-400';
                if (log.level === 'success') badgeColor = 'text-emerald-400';
                if (log.level === 'warn') badgeColor = 'text-amber-400';
                if (log.level === 'error') badgeColor = 'text-rose-400';

                return (
                  <div key={i} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-600 select-none">[{log.time}]</span>
                    <span className={`uppercase text-[10px] font-bold ${badgeColor}`}>[{log.level}]</span>
                    <span className="text-slate-300 break-words flex-1">{log.message}</span>
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
    </div>
  );
};
