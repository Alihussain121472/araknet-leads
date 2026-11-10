import type { Metadata } from 'next';
import Link from 'next/link';
import { BusinessCalculator } from '@/components/BusinessCalculator';

export const metadata: Metadata = { title: 'Marketing Budget Calculator | Araknet', description: 'Build a simple sustainable marketing budget for your small business.' };

export default function MarketingBudgetCalculatorPage() {
  return <main className="mx-auto max-w-5xl px-5 py-16"><Link href="/tools" className="text-sm text-brand-link">← All tools</Link><div className="mt-8 grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Free calculator</p><h1 className="mt-3 text-4xl font-bold">Plan a marketing budget you can sustain</h1><p className="mt-5 text-lg leading-8 text-text-secondary">A consistent, measurable budget is more useful than a large one you cannot maintain. Start with a baseline and adjust it as you learn.</p><div className="mt-8 space-y-4 text-text-secondary"><p><strong className="text-text-primary">A balanced starting mix:</strong> reserve part of your budget for content and local SEO, part for testing paid promotion, and part for measurement or creative work.</p><p><strong className="text-text-primary">Review monthly:</strong> track enquiries, qualified leads, and revenue rather than clicks alone.</p></div></div><BusinessCalculator kind="marketing" /></div></main>;
}
