import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, Calculator, CheckCircle2, FileText, Search, Sparkles } from 'lucide-react';
import { PublicGrowthHub } from '@/components/PublicGrowthHub';
import { AdSlot } from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Free Marketing Tools for Small Businesses | Araknet',
  description: 'Free website cost, marketing budget, SEO, and proposal tools for local businesses, freelancers, and agencies.',
  alternates: { canonical: 'https://araknet.tech/' },
};

const tools = [
  { title: 'Website Cost Calculator', description: 'Estimate a realistic website budget before speaking to a freelancer or agency.', href: '/tools/website-cost-calculator', icon: Calculator },
  { title: 'Marketing Budget Calculator', description: 'Build a simple monthly marketing budget around your goals and business size.', href: '/tools/marketing-budget-calculator', icon: BarChart3 },
  { title: 'Local SEO Checklist', description: 'Follow a practical checklist to help your business get found in local search.', href: '/tools/local-seo-checklist', icon: Search },
  { title: 'Proposal Generator', description: 'Turn a project brief into a clear, professional proposal in minutes.', href: '/proposals', icon: FileText },
];

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-border-default bg-page/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="brand-mark"><Sparkles className="h-4 w-4" /></span> Araknet
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex">
            <Link href="#tools" className="hover:text-brand-link">Free tools</Link>
            <Link href="#how-it-works" className="hover:text-brand-link">How it works</Link>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent-emerald">100% free tools</span>
          </nav>
          <a href="#tools" className="btn-primary rounded-lg px-3 py-2 text-sm font-semibold md:hidden">Explore tools</a>
        </div>
      </header>

      <section className="discovery-banner border-b border-border-default">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Free growth tools for local businesses</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">Make smarter marketing decisions before you spend.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">Use practical calculators, checklists, and proposal tools to price your website, plan your marketing, improve local visibility, and win better work.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#tools" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold">Explore free tools <ArrowRight className="h-4 w-4" /></a>
              <a href="#how-it-works" className="btn-ghost inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold">See how it works</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-text-secondary">
              {['No signup', 'No paywall', 'Built for small businesses'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" />{item}</span>)}
            </div>
          </div>
          <PublicGrowthHub />
        </div>
      </section>

      <AdSlot />

      <section id="tools" className="mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Start here</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Tools that answer expensive questions</h2><p className="mt-4 text-text-secondary">Get a useful answer in a few minutes, then use the next step to improve your business.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ title, description, href, icon: Icon }) => <Link key={href} href={href} className="card group p-6 transition hover:-translate-y-1 hover:border-brand-primary"><Icon className="h-6 w-6 text-brand-link" /><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-link">Use tool <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></Link>)}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border-default bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-3">
          {[['01', 'Choose a tool', 'Start with the question you need to answer today.'], ['02', 'Get a clear baseline', 'Use transparent assumptions instead of confusing jargon.'], ['03', 'Leave with an answer', 'Every calculator and checklist works without an account.']].map(([number, title, description]) => <div key={number}><span className="text-sm font-bold text-brand-link">{number}</span><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-2 text-text-secondary">{description}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center"><h2 className="text-3xl font-bold">A useful answer, without a paywall</h2><p className="mx-auto mt-4 max-w-2xl text-text-secondary">Bookmark Araknet and return whenever you need a quick marketing estimate, checklist, or planning baseline.</p><a href="#tools" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold">Browse all free tools <ArrowRight className="h-4 w-4" /></a></section>
    </main>
  );
}
