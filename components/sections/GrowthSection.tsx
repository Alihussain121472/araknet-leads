'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Lead } from '@/lib/types';
import { INDUSTRIES } from '@/lib/constants';
import { leadIntelligence, parseCampaignCities } from '@/lib/lead-intelligence';
import { apiFetch } from '@/lib/api-client';

type Health = { databaseReady: boolean; message: string; directory: string; cronConfigured: boolean; scheduleEnabled: boolean };
export function GrowthSection({ leads, busy, onBusyChange, onRefresh, onOpenLead }: { leads: Lead[]; busy: boolean; onBusyChange: (busy: boolean) => void; onRefresh: () => Promise<void>; onOpenLead: (lead: Lead) => void }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [citiesText, setCitiesText] = useState('Karachi, Lahore, Islamabad');
  const [industry, setIndustry] = useState('Restaurant');
  const [batch, setBatch] = useState(10);
  const [campaign, setCampaign] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const stop = useRef(false);
  const [minScore, setMinScore] = useState(0);
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const cities = parseCampaignCities(citiesText);
  const ranked = useMemo(() => leads.map(lead => ({ lead, insight: leadIntelligence(lead) })).filter(({lead, insight}) => insight.priority >= minScore && (!phoneOnly || insight.phone) && (!newOnly || lead.lead_status === 'new')).sort((a,b) => b.insight.priority - a.insight.priority), [leads, minScore, phoneOnly, newOnly]);
  const selected = leads.find(lead => lead.id === selectedId);
  const insight = selected ? leadIntelligence(selected) : null;
  const refreshHealth = async () => {
    setHealthLoading(true);
    try { setHealth(await (await apiFetch('/api/health')).json()); } catch (e) { setError(e instanceof Error ? e.message : 'Could not check setup'); }
    finally { setHealthLoading(false); }
  };
  useEffect(() => { void refreshHealth(); return () => { stop.current = true; }; }, []);
  const selectLead = (lead: Lead) => { setSelectedId(lead.id); setDraft(leadIntelligence(lead).draft); setCopied(false); };
  const runCampaign = async () => {
    if (busy || !health?.databaseReady || !country.trim() || !cities.length || cities.length > 5 || cities.some(city => city.length > 120)) return;
    stop.current = false; setCampaign(true); onBusyChange(true); setError(''); setProgress([]);
    try {
      for (const city of cities) {
        if (stop.current) break;
        setProgress(lines => [...lines, `Searching ${city}...`]);
        const res = await apiFetch('/api/agent/run', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({country: country.trim(), city, industry, maxResults: batch}), signal: AbortSignal.timeout(125000) });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || `Search failed in ${city}`);
        setProgress(lines => [...lines, `${city}: ${result.leadsFound} new leads, ${result.leadsQualified} qualified.`]);
        await onRefresh();
      }
      setProgress(lines => [...lines, stop.current ? 'Stopped after the current city.' : 'Campaign complete. Review your shortlist below.']);
    } catch (e) { setError(e instanceof Error ? e.message : 'Campaign failed'); }
    finally { setCampaign(false); onBusyChange(false); }
  };
  const panel = 'rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4';
  const field = 'w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm';
  return <div className="space-y-6">
    {error && <p role="alert" className="rounded-xl bg-rose-950 p-4 text-rose-200">{error}</p>}
    <section className={panel}>
      <div className="flex justify-between gap-3"><h2 className="text-lg font-bold">Setup health</h2><button disabled={healthLoading} onClick={refreshHealth} className="text-sm text-blue-400 disabled:opacity-50">{healthLoading ? 'Checking...' : 'Check again'}</button></div>
      <p className={health?.databaseReady ? 'text-emerald-400 text-sm' : 'text-amber-300 text-sm'}>{health?.message || 'Checking your database connection...'}</p>
      {health && <div className="flex flex-wrap gap-4 text-xs text-slate-400"><span>Directory: {health.directory}</span><span>Scheduler: {health.cronConfigured ? health.scheduleEnabled ? 'Enabled' : 'Ready; enable in Agent Control' : 'Needs configuration'}</span></div>}
    </section>
    <section className={panel}>
      <h2 className="text-lg font-bold">Search several cities</h2>
      <p className="text-sm text-slate-400">Up to five cities, searched one at a time. Keep this page open. Results are saved after each city. Configured paid directories may charge for each search.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Country<input className={field} value={country} maxLength={120} disabled={busy} onChange={e=>setCountry(e.target.value)} /></label>
        <label className="text-sm">Industry<select className={field} value={industry} disabled={busy} onChange={e=>setIndustry(e.target.value)}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></label>
        <label className="text-sm">Cities, separated by commas<textarea className={field} value={citiesText} disabled={busy} onChange={e=>setCitiesText(e.target.value)} /></label>
        <label className="text-sm">Results per city<select className={field} value={batch} disabled={busy} onChange={e=>setBatch(Number(e.target.value))}>{[5,10,20].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
      </div>
      <div className="flex flex-wrap items-center gap-4"><button onClick={runCampaign} disabled={busy || !health?.databaseReady || !country.trim() || !cities.length || cities.length > 5} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold disabled:opacity-40">{campaign ? 'Searching...' : `Search ${cities.length} cities`}</button><span className="text-xs text-slate-400">Up to {Math.min(cities.length,5)*batch} results before deduplication</span>{campaign && <button onClick={()=>{stop.current=true;setProgress(lines=>[...lines,'Stop requested; current city will finish.']);}} className="text-sm text-amber-300">Stop after this city</button>}</div>
      {cities.length > 5 && <p role="alert" className="text-sm text-amber-300">Use five cities or fewer per campaign.</p>}
      <div role="log" aria-live="polite" className="space-y-1 text-sm text-slate-400">{progress.map((line,i)=><p key={i}>{line}</p>)}</div>
    </section>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className={panel}>
        <h2 className="text-lg font-bold">Prioritized shortlist</h2><p className="text-sm text-slate-400">Ranks website opportunity, industry fit, contact availability and review evidence. This is a prospecting score, not a conversion prediction.</p>
        <div className="flex flex-wrap gap-4 text-sm"><label>Minimum priority <select className="bg-slate-950 p-2 rounded" value={minScore} onChange={e=>setMinScore(Number(e.target.value))}>{[0,40,60,80].map(n=><option key={n}>{n}</option>)}</select></label><label><input type="checkbox" checked={phoneOnly} onChange={e=>setPhoneOnly(e.target.checked)} /> Phone listed</label><label><input type="checkbox" checked={newOnly} onChange={e=>setNewOnly(e.target.checked)} /> New leads only</label></div>
        <p className="text-xs text-slate-500">{ranked.length} matching leads</p>
        <div className="max-h-[560px] overflow-y-auto space-y-2">{ranked.slice(0,100).map(({lead,insight})=><button key={lead.id} onClick={()=>selectLead(lead)} className={`w-full rounded-xl border p-4 text-left ${selectedId===lead.id?'border-blue-500 bg-blue-950/40':'border-slate-800 bg-slate-950/50'}`}><div className="flex justify-between gap-3"><strong className="text-sm">{lead.business_name}</strong><span className="text-cyan-400 font-bold">{insight.priority}/100</span></div><p className="text-xs text-slate-400 mt-1">{lead.city} · {lead.industry}</p><p className="text-xs text-slate-400 mt-2">{insight.nextAction}</p></button>)}</div>
        {!ranked.length && <p className="text-sm text-slate-400">No matching leads yet. Complete setup, run a search, or loosen your filters.</p>}
      </section>
      <section className={panel}>
        <h2 className="text-lg font-bold">Evidence and outreach draft</h2>
        {selected && insight ? <><h3 className="font-semibold">{selected.business_name}</h3><dl className="text-sm space-y-2">{Object.entries(insight.breakdown).map(([key,value])=><div key={key} className="flex justify-between"><dt className="text-slate-400">{key}</dt><dd>{value} points</dd></div>)}</dl><p className="text-xs text-slate-400">Data completeness: {insight.completeness}% · Source: {selected.source_provider} · Last updated: {insight.age ?? 'unknown'} days ago. A missing field is not proof that a business lacks that capability.</p><p className="text-sm text-cyan-300">Next step: {insight.nextAction}</p><label className="block text-sm">Editable draft<textarea rows={10} value={draft} onChange={e=>{setDraft(e.target.value);setCopied(false);}} className={field} /></label><p className="text-xs text-slate-500">Template based on listing data. Verify claims, add your identity and review before sending. Nothing is sent automatically.</p><div className="flex gap-4"><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm" onClick={async()=>{try{await navigator.clipboard.writeText(draft);setCopied(true);}catch{setError('Clipboard unavailable. Select and copy the draft manually.');}}}>{copied?'Copied':'Copy draft'}</button><button className="text-sm text-blue-400" onClick={()=>onOpenLead(selected)}>Open full lead</button></div></> : <p className="text-sm text-slate-400">Choose a lead to see its score breakdown, next step and personalized draft.</p>}
      </section>
    </div>
  </div>;
}
