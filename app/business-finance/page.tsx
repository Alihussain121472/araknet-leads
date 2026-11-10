import type { Metadata } from 'next';
import { CalculatorGrid } from '@/components/CalculatorGrid';
export const metadata: Metadata = { title: 'Business Finance Calculators | Araknet', description: 'Free calculators for business loans, freelancers, and marketing performance.' };
export default function BusinessFinancePage() { return <main className="mx-auto max-w-7xl px-5 py-16"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Business finance</p><h1 className="mt-3 text-4xl font-bold">Plan the business behind the work</h1><p className="mt-4 max-w-2xl text-lg text-text-secondary">Use practical estimates for borrowing, freelance pricing, and campaign performance.</p><div className="mt-10"><CalculatorGrid category="business-finance" /></div></main>; }
