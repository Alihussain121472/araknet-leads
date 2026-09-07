import React from 'react';
import { 
  Users, 
  PhoneCall, 
  Send, 
  Trophy, 
  Percent, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Globe, 
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DashboardStats, Lead, LeadActivity } from '@/lib/types';
import { STATUS_COLORS, WEBSITE_STATUS_BADGES } from '@/lib/constants';

interface OverviewSectionProps {
  stats: DashboardStats;
  recentLeads: Lead[];
  activities: LeadActivity[];
  onOpenLead: (lead: Lead) => void;
  onLaunchAgent: () => void;
  onViewAllLeads: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  stats,
  recentLeads,
  activities,
  onOpenLead,
  onLaunchAgent,
  onViewAllLeads,
}) => {
  const statCards = [
    {
      title: 'Total Leads Found',
      value: stats.totalLeads,
      icon: Users,
      trend: '+12% this week',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Leads Contacted',
      value: stats.leadsContacted,
      icon: PhoneCall,
      trend: '3 active in outreach',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Proposals Sent',
      value: stats.proposalsSent,
      icon: Send,
      trend: '2 awaiting review',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
    },
    {
      title: 'Deals Won',
      value: stats.dealsWon,
      icon: Trophy,
      trend: '$8,400 pipeline revenue',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Percent,
      trend: 'Avg 4.8 days to close',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/20 p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Lead Discovery Engine
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Ready to discover businesses that need websites & AI automation?
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Your agent scans Google Places and business directories to find companies with zero website, broken mobile layouts, or high-value automation potential.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onLaunchAgent}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Launch Discovery Agent</span>
              <ArrowUpRight className="w-4 h-4 text-white/80" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} bg-slate-900/60 border backdrop-blur-md shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{card.trend}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split Grid: High Opportunity Leads & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top High-Opportunity Prospects (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Prime Digital Opportunities
              </h3>
              <p className="text-xs text-slate-400">Businesses with highest need for websites & automation</p>
            </div>
            <button
              onClick={onViewAllLeads}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Leads</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLeads.slice(0, 4).map((lead) => {
              const statusCfg = STATUS_COLORS[lead.lead_status] || STATUS_COLORS.new;
              const webBadge = WEBSITE_STATUS_BADGES[lead.website_status] || WEBSITE_STATUS_BADGES.no_website;
              
              return (
                <div
                  key={lead.id}
                  onClick={() => onOpenLead(lead)}
                  className="group p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/60 border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                          {lead.business_name}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${webBadge.bg} ${webBadge.text}`}>
                          {webBadge.label}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{lead.industry}</span>
                        <span>•</span>
                        <span>{lead.city}, {lead.country}</span>
                        {lead.google_rating && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">★ {lead.google_rating} ({lead.google_reviews_count} reviews)</span>
                          </>
                        )}
                      </p>

                      {lead.opportunity_reason && (
                        <p className="text-xs text-slate-300 line-clamp-1 italic pt-1">
                          &ldquo;{lead.opportunity_reason}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end justify-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-amber-400">{lead.opportunity_score}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Opportunity</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Activity Feed */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Activity Feed
            </h3>
            <p className="text-xs text-slate-400">Chronological timeline of agent & lead events</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4 shadow-lg">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent activity recorded yet.</p>
            ) : (
              activities.map((act, index) => (
                <div key={act.id || index} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <p className="text-slate-200 font-medium leading-tight">{act.description}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
