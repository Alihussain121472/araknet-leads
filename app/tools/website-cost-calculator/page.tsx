import type { Metadata } from 'next';
import Link from 'next/link';
import { BusinessCalculator } from '@/components/BusinessCalculator';

export const metadata: Metadata = { title: 'Website Cost Calculator | Araknet', description: 'Estimate how much a small-business website may cost based on its goals and scope.' };

export default function WebsiteCostCalculatorPage() {
  return <main className="mx-auto max-w-5xl px-5 py-16"><Link href="/tools" className="text-sm text-brand-link">← All tools</Link><div className="mt-8 grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Free calculator</p><h1 className="mt-3 text-4xl font-bold">How much should a website cost?</h1><p className="mt-5 text-lg leading-8 text-text-secondary">Use this quick estimate to set expectations before comparing proposals. It is designed for local businesses and small teams.</p><div className="mt-8 space-y-4 text-text-secondary"><p><strong className="text-text-primary">What changes the price?</strong> Page count, copywriting, photography, booking or ecommerce features, integrations, and ongoing maintenance all affect the final quote.</p><p><strong className="text-text-primary">Tip:</strong> Ask for a written scope, ownership of your domain and content, and a clear support plan.</p></div></div><BusinessCalculator kind="website" /></div></main>;
}
