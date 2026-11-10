import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

export const metadata: Metadata = { title: 'Local SEO Checklist | Araknet', description: 'A practical local SEO checklist for small businesses that want to be easier to find.' };
const checks = ['Claim and verify your Google Business Profile', 'Use the same business name, address, and phone everywhere', 'Add accurate opening hours, services, and photos', 'Ask happy customers for honest reviews', 'Create one useful page for each main service and location', 'Test your website on a phone and fix broken contact forms', 'Measure calls, direction requests, forms, and booked jobs'];

export default function LocalSeoChecklistPage() {
  return <main className="mx-auto max-w-3xl px-5 py-16"><Link href="/tools" className="text-sm text-brand-link">← All tools</Link><p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Free checklist</p><h1 className="mt-3 text-4xl font-bold">Local SEO checklist for small businesses</h1><p className="mt-5 text-lg leading-8 text-text-secondary">Work through these fundamentals before paying for advanced SEO. Search visibility starts with accurate information and a useful customer experience.</p><AdSlot /><div className="card mt-10 divide-y divide-border-default">{checks.map((check) => <div key={check} className="flex gap-4 p-5"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent-emerald" /><span>{check}</span></div>)}</div><div className="mt-10 rounded-xl bg-brand-soft p-6"><h2 className="text-xl font-semibold">Keep this checklist handy</h2><p className="mt-2 text-text-secondary">Bookmark this page and work through one improvement at a time. No account or payment is required.</p></div></main>;
}
