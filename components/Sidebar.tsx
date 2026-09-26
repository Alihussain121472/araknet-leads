import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  BarChart3, 
  Settings, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  agentRunning: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, agentRunning }) => {
  const [role, setRole] = React.useState<string>('user');

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setRole(data.user.role);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard, badge: null },
    { 
      id: 'agent', 
      label: 'Find Leads', 
      icon: Bot, 
      badge: agentRunning ? 'Running' : 'Ready' 
    },
    { id: 'leads', label: 'My Leads', icon: Users, badge: null },
    { id: 'proposals', label: 'Proposals', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border-default flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-sm dark:shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary tracking-tight leading-none">
                Araknet <span className="text-accent-cyan text-xs font-semibold uppercase tracking-wider">AI</span>
              </h1>
              <p className="text-xs text-text-secondary mt-1 font-medium">Business Discovery SaaS</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-text-secondary">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-soft text-brand-link border border-blue-500/30 shadow-sm'
                    : 'text-text-secondary hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-link' : 'text-text-secondary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      agentRunning
                        ? 'bg-amber-500/20 text-amber-600 dark:text-accent-amber border border-amber-500/30 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'
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
      <div className="p-4 border-t border-border-default space-y-3">
        {role === 'admin' && (
          <a
            href="/admin"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 text-accent-amber border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Dashboard
          </a>
        )}
        <div className="bg-page p-3 rounded-xl border border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-brand-link font-bold text-xs">
              {role === 'admin' ? 'ADM' : 'USR'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-text-primary truncate">Araknet Workspace</p>
              <p className="text-[11px] text-accent-emerald flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {role === 'admin' ? 'Owner Dashboard' : 'User Dashboard'}
              </p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-text-secondary" />
        </div>
      </div>
    </aside>
  );
};
