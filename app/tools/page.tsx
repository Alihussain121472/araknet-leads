import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, Calculator, FileText, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Business Growth Tools | Araknet',
  description: 'Explore free calculators, SEO checklists, and proposal tools for local businesses and freelancers.',
  alternates: { canonical: 'https://araknet.tech/tools' },
};

const tools = [
  ['Website Cost Calculator', 'Estimate your website budget by business type, pages, features, and support needs.', '/tools/website-cost-calculator', Calculator],
  ['Marketing Budget Calculator', 'Plan a practical monthly budget for content, ads, SEO, and local promotion.', '/tools/marketing-budget-calculator', BarChart3],
  ['Local SEO Checklist', 'A step-by-step checklist for improving your business visibility in local search.', '/tools/local-seo-checklist', Search],
  ['Proposal Generator', 'Create a polished starting proposal for your next client project.', '/proposals', FileText],
] as const;

export default function ToolsPage() {
  return <main className="mx-auto max-w-7xl px-5 py-16"><Link href="/" className="text-sm text-brand-link">← Araknet home</Link><h1 className="mt-8 text-4xl font-bold">Free business growth tools</h1><p className="mt-4 max-w-2xl text-lg text-text-secondary">Practical tools for local businesses, freelancers, and agencies. Start with a question and leave with a clear next step.</p><div className="mt-12 grid gap-5 md:grid-cols-2">{tools.map(([title, description, href, Icon]) => <Link href={href} key={href} className="card flex gap-5 p-7 transition hover:border-brand-primary"><Icon className="mt-1 h-7 w-7 shrink-0 text-brand-link" /><span><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-text-secondary">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-link">Open tool <ArrowRight className="h-4 w-4" /></span></span></Link>)}</div></main>;
}
