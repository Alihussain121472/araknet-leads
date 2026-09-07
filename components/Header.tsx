import React from 'react';
import { Play, Sparkles, RefreshCw, Bell } from 'lucide-react';

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
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Agent Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              agentRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-300 font-medium">
            Agent Status: {agentRunning ? 'Running Discovery...' : 'Idle / Ready'}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Quick Run button */}
        <button
          onClick={onQuickRun}
          disabled={agentRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all ${
            agentRunning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 active:scale-95'
          }`}
        >
          {agentRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Markets...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Quick Scan</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
