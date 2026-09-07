import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  BarChart3, 
  Settings, 
  Sparkles, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  agentRunning: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, agentRunning }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { 
      id: 'agent', 
      label: 'Agent Control', 
      icon: Bot, 
      badge: agentRunning ? 'Running' : 'Ready' 
    },
    { id: 'leads', label: 'Leads Directory', icon: Users, badge: null },
    { id: 'reports', label: 'Export & Reports', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Araknet <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">AI</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">Business Discovery SaaS</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      agentRunning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              DEV
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">Agency Workspace</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Local Engine Online
              </p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
};
