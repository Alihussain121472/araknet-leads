'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { OverviewSection } from '@/components/sections/OverviewSection';
import { AgentControlSection } from '@/components/sections/AgentControlSection';
import { LeadsTableSection } from '@/components/sections/LeadsTableSection';
import { LeadDetailModal } from '@/components/sections/LeadDetailModal';
import { SettingsSection } from '@/components/sections/SettingsSection';
import { ProposalAgentSection } from '@/components/sections/ProposalAgentSection';
import { apiFetch } from '@/lib/api-client';
import { Lead, DashboardStats, AgentRun, AgentLog, LeadActivity, LeadNote, UserSettings } from '@/lib/types';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsContacted: 0,
    proposalsSent: 0,
    dealsWon: 0,
    conversionRate: 0,
    highOpportunityCount: 0,
  });
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [agentRunning, setAgentRunning] = useState<boolean>(false);
  const [latestRun, setLatestRun] = useState<AgentRun | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  const [error, setError] = useState('');

  const [newlyFetchedLeads, setNewlyFetchedLeads] = useState<Lead[]>([]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const res = await apiFetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching leads');
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  // Fetch KPI stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentActivities) setActivities(data.recentActivities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stats');
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setUserSettings(data.settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching settings');
    }
  }, []);

  // Fetch agent status & logs
  const fetchAgentStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/agent/status');
      if (res.ok) {
        const data = await res.json();
        if (data.latestRun) {
          setLatestRun(data.latestRun);
          if (!agentRunning) setLogs(data.latestRun.logs || []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching agent status');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeads();
    fetchStats();
    fetchSettings();
    fetchAgentStatus();
  }, [fetchLeads, fetchStats, fetchSettings, fetchAgentStatus]);

  useEffect(() => {
    const timer = setInterval(() => {
      void fetchLeads();
      void fetchStats();
      void fetchAgentStatus();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchLeads, fetchStats, fetchAgentStatus]);

  useEffect(() => {
    if (!agentRunning) return;
    const timer = setInterval(() => { void fetchAgentStatus(); }, 5000);
    return () => clearInterval(timer);
  }, [agentRunning, fetchAgentStatus]);

  // Trigger agent run
  const handleTriggerRun = async (params: {
    country: string;
    city: string;
    industry: string;
    maxResults: number;
  }) => {
    if (agentRunning) return;
    setError('');
    setAgentRunning(true);
    setNewlyFetchedLeads([]);
    setLogs([
      {
        time: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Agent dispatched to ${params.city}, ${params.country} [${params.industry}]...`,
      }
    ]);

    try {
      const res = await apiFetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Search failed'); }
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
        if (data.leads && data.leads.length > 0) setNewlyFetchedLeads(data.leads);
        if (!data.success) throw new Error(data.error || 'Discovery did not complete');
        // Refresh leads & stats
        await fetchLeads();
        await fetchStats();
        await fetchAgentStatus();
      }
    } catch (err) {
      setLogs(prev => [...prev, {time:new Date().toLocaleTimeString(),level:'error',message:err instanceof Error ? err.message : 'Search failed'}]);
    } finally {
      setAgentRunning(false);
    }
  };

  // Quick run from header button
  const handleQuickRun = async () => {
    setActiveTab('agent');
    const country = userSettings?.schedule_country?.trim() || '';
    const city = userSettings?.schedule_city?.trim() || '';
    if (!country || !city) {
      setError('Choose a target country and city in the Discovery Agent before using Quick Scan.');
      return;
    }
    await handleTriggerRun({
      country,
      city,
      industry: userSettings?.schedule_industry || 'All',
      maxResults: 8,
    });
  };

  // Update lead status (e.g. new -> contacted)
  const handleUpdateStatus = async (id: string, newStatus: any) => {
    try {
      const res = await apiFetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_status: newStatus }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, lead_status: newStatus } : l))
        );
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, lead_status: newStatus } : null));
        }
        await fetchStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
    }
  };

  // Update tags
  const handleUpdateTags = async (id: string, tags: string[]) => {
    try {
      const res = await apiFetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });

      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, tags } : l)));
      setSelectedLead(prev => prev?.id === id ? { ...prev, tags } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tags');
    }
  };

  // Add personal note
  const handleAddNote = async (leadId: string, content: string): Promise<LeadNote | null> => {
    try {
      const res = await apiFetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchStats();
        return data.note;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    }
    return null;
  };

  // Delete lead
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await apiFetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedLead(null);
        await fetchStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  // Export to CSV
  const handleExportCsv = (selectedIds?: string[]) => {
    const query = new URLSearchParams({format:'csv'});
    if (selectedIds?.length) query.set('ids',selectedIds.join(','));
    window.open('/api/leads/export?' + query.toString(), '_blank');
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: any) => {
    const response = await apiFetch('/api/settings', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newSettings)});
    if (!response.ok) throw new Error('Settings could not be saved');
    const data = await response.json();
    if (data.settings) setUserSettings(data.settings);
  };

  // Tab Header Details
  const getTabHeader = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Executive Overview',
          subtitle: 'Real-time metrics, conversion funnel, and prime opportunities',
        };
      case 'agent':
        return {
          title: 'Discover Business Leads',
          subtitle: 'Configure target markets, trigger discovery runs, and inspect live logs to find your clients leads with ai agent',
        };
      case 'leads':
        return {
          title: 'My Leads',
          subtitle: `Discovered business candidates (${leads.length} total) with digital presence audit`,
        };
      case 'proposals':
        return {
          title: 'Proposals',
          subtitle: 'Generate targeted proposals for your selected leads',
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'API keys, system configuration, and preferences',
        };
      default:
        return { title: 'Dashboard', subtitle: 'Lead Discovery Platform' };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="flex min-h-screen bg-page text-text-primary ">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentRunning={agentRunning}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          agentRunning={agentRunning}
          onQuickRun={handleQuickRun}
          onRefresh={() => {
            fetchLeads();
            fetchStats();
            fetchSettings();
            fetchAgentStatus();
          }}
        />

        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {error && <div role="alert" className="mb-5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 text-accent-rose p-4 text-sm">{error}<button onClick={() => setError('')} className="ml-4 underline">Dismiss</button></div>}
          <form action="/api/auth/logout" method="post" className="mb-4 text-right"><button className="text-xs text-text-secondary hover:text-text-primary">Sign out</button></form>
          {activeTab === 'overview' && (
            <OverviewSection
              stats={stats}
              recentLeads={leads}
              activities={activities}
              onOpenLead={(lead) => setSelectedLead(lead)}
              onLaunchAgent={() => setActiveTab('agent')}
              onViewAllLeads={() => setActiveTab('leads')}
            />
          )}

          {activeTab === 'agent' && (
            <AgentControlSection
              agentRunning={agentRunning}
              onTriggerRun={handleTriggerRun}
              latestRun={latestRun}
              logs={logs}
              newlyFetchedLeads={newlyFetchedLeads}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsTableSection
              leads={leads}
              onOpenLead={(lead) => setSelectedLead(lead)}
              onUpdateStatus={handleUpdateStatus}
              onExportCsv={handleExportCsv}
              isLoading={isLoadingLeads}
              onCreateProposal={(lead) => {
                setSelectedLead(lead);
                setActiveTab('proposals');
              }}
            />
          )}

          {activeTab === 'proposals' && (
            <ProposalAgentSection leads={leads} selectedLeadForProposal={selectedLead} />
          )}

          {activeTab === 'settings' && (
            <SettingsSection onSaveSettings={handleSaveSettings} />
          )}
        </main>
      </div>

      {/* Slide-over Lead Detail Drawer */}
      {selectedLead && activeTab !== 'proposals' && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateTags={handleUpdateTags}
          onAddNote={handleAddNote}
          onDeleteLead={handleDeleteLead}
          onCreateProposal={(lead) => {
            setSelectedLead(lead);
            setActiveTab('proposals');
          }}
        />
      )}
    </div>
  );
}
