import React from 'react';
import { Play, Sparkles, RefreshCw, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  title: string;
  subtitle: string;
  agentRunning: boolean;
  onQuickRun: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  agentRunning,
  onQuickRun,
  onRefresh,
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-10 bg-card border-b border-border-default shadow-sm">
      <div>
        <h1 className="logo-text text-xl">{title}</h1>
        <p className="text-[var(--text-secondary)] mt-0.5 text-xs">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Agent Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
          <span
            className={`w-2 h-2 rounded-full ${
              agentRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            Status: {agentRunning ? 'Running Discovery...' : 'Active'}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="btn-ghost p-2 rounded-xl"
          title="Toggle Theme"
          aria-label={mounted && resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mounted && resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="btn-ghost p-2 rounded-xl"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onQuickRun}
          disabled={agentRunning}
          className={`btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${
            agentRunning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {agentRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Markets...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Quick Scan</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
