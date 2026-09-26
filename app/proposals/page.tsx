import React from 'react';
import Link from 'next/link';
import { ProposalAgentSection } from '@/components/sections/ProposalAgentSection';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Proposal Strategist | Araknet AI',
  description: 'AI-Powered Freelance Proposal Strategist for Upwork, Direct Outreach, LinkedIn, and Agency RFPs.',
};

export default function ProposalsPage() {
  return (
    <div className="min-h-screen bg-page text-text-primary flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border-default bg-card backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-card-hover hover:bg-page text-text-primary border border-border-default transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none">
                Araknet <span className="text-accent-cyan font-normal">| Proposal Strategist</span>
              </h1>
              <p className="text-[11px] text-text-secondary mt-0.5">araknet.tech AI Proposal Engine</p>
            </div>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 rounded-xl bg-brand-soft hover:bg-card-hover text-brand-link border border-blue-500/30 font-medium transition"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <ProposalAgentSection />
      </main>
    </div>
  );
}
