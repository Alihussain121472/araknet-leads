import type { Metadata } from 'next';
import { CalculatorGrid } from '@/components/CalculatorGrid';
export const metadata: Metadata = { title: 'Loan Calculators | Araknet', description: 'Free personal, auto, and debt consolidation loan calculators.' };
export default function LoansPage() { return <main className="mx-auto max-w-7xl px-5 py-16"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Loans</p><h1 className="mt-3 text-4xl font-bold">Loan calculators</h1><p className="mt-4 max-w-2xl text-lg text-text-secondary">Estimate payments and compare borrowing scenarios before you speak with a lender.</p><div className="mt-10"><CalculatorGrid category="loans" /></div></main>; }
