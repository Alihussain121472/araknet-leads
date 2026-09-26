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
      trend: 'Saved business records',
      color: 'text-accent-blue',
    },
    {
      title: 'Leads Contacted',
      value: stats.leadsContacted,
      icon: PhoneCall,
      trend: 'Currently marked contacted',
      color: 'text-accent-amber',
    },
    {
      title: 'Proposals Sent',
      value: stats.proposalsSent,
      icon: Send,
      trend: 'Currently at proposal stage',
      color: 'text-accent-purple',
    },
    {
      title: 'Deals Won',
      value: stats.dealsWon,
      icon: Trophy,
      trend: 'Marked won in your pipeline',
      color: 'text-accent-emerald',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Percent,
      trend: 'Won deals / all saved leads',
      color: 'text-accent-cyan',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl discovery-banner border border-border-default p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-blue-500/20 text-xs font-semibold text-accent-blue mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Lead Discovery Engine
            </div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Ready to discover businesses that need websites & AI automation?
            </h2>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Your agent searches business directories for website listings and estimates automation opportunities by industry. Verify each opportunity before outreach.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onLaunchAgent}
              className="btn-primary flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Launch Discovery Agent</span>
              <ArrowUpRight className="w-4 h-4 text-white" />
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
              className={`p-5 rounded-2xl ${card.color} bg-card border border-border-default shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">{card.title}</span>
                <div className="p-2 rounded-xl bg-page border border-border-default">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-text-primary tracking-tight">{card.value}</div>
                <div className="text-[11px] text-text-secondary mt-1 font-medium">{card.trend}</div>
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
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-amber" />
                Prime Digital Opportunities
              </h3>
              <p className="text-xs text-text-secondary">Businesses with highest need for websites & automation</p>
            </div>
            <button
              onClick={onViewAllLeads}
              className="text-xs font-semibold text-brand-link hover:text-accent-blue flex items-center gap-1 transition-colors"
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
                  className="group p-4 rounded-xl bg-card hover:bg-card-hover border border-border-default hover:border-blue-500/40 transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-text-primary group-hover:text-brand-link transition-colors">
                          {lead.business_name}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${webBadge.bg} ${webBadge.text}`}>
                          {webBadge.label}
                        </span>
                      </div>
                      
                      <p className="text-xs text-text-secondary flex items-center gap-2">
                        <span>{lead.industry}</span>
                        <span>•</span>
                        <span>{lead.city}, {lead.country}</span>
                        {lead.google_rating && (
                          <>
                            <span>•</span>
                            <span className="text-accent-amber font-medium">★ {lead.google_rating} ({lead.google_reviews_count} reviews)</span>
                          </>
                        )}
                      </p>

                      {lead.opportunity_reason && (
                        <p className="text-xs text-text-primary line-clamp-1 italic pt-1">
                          &ldquo;{lead.opportunity_reason}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end justify-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-accent-amber">{lead.opportunity_score}</span>
                        <span className="text-[10px] text-text-secondary font-semibold">/100</span>
                      </div>
                      <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Opportunity</span>
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
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-link" />
              Recent Activity Feed
            </h3>
            <p className="text-xs text-text-secondary">Chronological timeline of agent & lead events</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border-default backdrop-blur-md space-y-4 shadow-sm dark:shadow-lg">
            {activities.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-6">No recent activity recorded yet.</p>
            ) : (
              activities.map((act, index) => (
                <div key={act.id || index} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-link" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <p className="text-text-primary font-medium leading-tight">{act.description}</p>
                    <p className="text-[11px] text-text-secondary">
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
