'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { OverviewSection } from '@/components/sections/OverviewSection';
import { AgentControlSection } from '@/components/sections/AgentControlSection';
import { LeadsTableSection } from '@/components/sections/LeadsTableSection';
import { LeadDetailModal } from '@/components/sections/LeadDetailModal';
import { ExportReportsSection } from '@/components/sections/ExportReportsSection';
import { SettingsSection } from '@/components/sections/SettingsSection';
import { Lead, DashboardStats, AgentRun, AgentLog, LeadActivity, LeadNote } from '@/lib/types';

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

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.warn('Error fetching leads', err);
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  // Fetch KPI stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentActivities) setActivities(data.recentActivities);
      }
    } catch (err) {
      console.warn('Error fetching stats', err);
    }
  }, []);

  // Fetch agent status & logs
  const fetchAgentStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/status');
      if (res.ok) {
        const data = await res.json();
        if (data.latestRun) {
          setLatestRun(data.latestRun);
          setLogs(data.latestRun.logs || []);
        }
      }
    } catch (err) {
      console.warn('Error fetching agent status', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeads();
    fetchStats();
    fetchAgentStatus();
  }, [fetchLeads, fetchStats, fetchAgentStatus]);

  // Trigger agent run
  const handleTriggerRun = async (params: {
    country: string;
    city: string;
    industry: string;
    maxResults: number;
  }) => {
    setAgentRunning(true);
    setLogs([
      {
        time: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Agent dispatched to ${params.city}, ${params.country} [${params.industry}]...`,
      }
    ]);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Search failed'); }
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
        // Refresh leads & stats
        await fetchLeads();
        await fetchStats();
        await fetchAgentStatus();
      }
    } catch (err) {
      setLogs([{time:new Date().toLocaleTimeString(),level:'error',message:err instanceof Error ? err.message : 'Search failed'}]);
    } finally {
      setAgentRunning(false);
    }
  };

  // Quick run from header button
  const handleQuickRun = async () => {
    setActiveTab('agent');
    await handleTriggerRun({
      country: 'United States',
      city: 'Austin',
      industry: 'Clinic & Healthcare',
      maxResults: 8,
    });
  };

  // Update lead status (e.g. new -> contacted)
  const handleUpdateStatus = async (id: string, newStatus: any) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
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
      console.error('Failed to update lead status', err);
    }
  };

  // Update tags
  const handleUpdateTags = async (id: string, tags: string[]) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, tags } : l))
      );
    } catch (err) {
      console.error('Failed to update tags', err);
    }
  };

  // Add personal note
  const handleAddNote = async (leadId: string, content: string): Promise<LeadNote | null> => {
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
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
      console.error('Failed to add note', err);
    }
    return null;
  };

  // Delete lead
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedLead(null);
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete lead', err);
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
    const response = await fetch('/api/settings', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newSettings)});
    if (!response.ok) throw new Error('Settings could not be saved');
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
          title: 'Agent Control Center',
          subtitle: 'Configure target markets, trigger discovery runs, and inspect live logs',
        };
      case 'leads':
        return {
          title: 'Leads Directory',
          subtitle: `Discovered business candidates (${leads.length} total) with digital presence audit`,
        };
      case 'reports':
        return {
          title: 'Export & Market Reports',
          subtitle: 'Dataset exports and geographic/industry intelligence distributions',
        };
      case 'settings':
        return {
          title: 'System Settings & Keys',
          subtitle: 'API vault, automated recurring cron schedules, and alert webhooks',
        };
      default:
        return { title: 'Dashboard', subtitle: 'Lead Discovery Platform' };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
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
            fetchAgentStatus();
          }}
        />

        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
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
            />
          )}

          {activeTab === 'leads' && (
            <LeadsTableSection
              leads={leads}
              onOpenLead={(lead) => setSelectedLead(lead)}
              onUpdateStatus={handleUpdateStatus}
              onExportCsv={handleExportCsv}
              isLoading={isLoadingLeads}
            />
          )}

          {activeTab === 'reports' && (
            <ExportReportsSection
              leads={leads}
              stats={stats}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection onSaveSettings={handleSaveSettings} />
          )}
        </main>
      </div>

      {/* Slide-over Lead Detail Drawer */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateTags={handleUpdateTags}
        onAddNote={handleAddNote}
        onDeleteLead={handleDeleteLead}
      />
    </div>
  );
}
