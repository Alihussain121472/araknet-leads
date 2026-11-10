import type { Metadata } from 'next';
import { CalculatorGrid } from '@/components/CalculatorGrid';
export const metadata: Metadata = { title: 'Investment Calculators | Araknet', description: 'Free compound interest and investment growth calculator.' };
export default function InvestmentPage() { return <main className="mx-auto max-w-7xl px-5 py-16"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Investment</p><h1 className="mt-3 text-4xl font-bold">Investment calculators</h1><p className="mt-4 max-w-2xl text-lg text-text-secondary">Model the possible effect of time, contributions, and compound growth.</p><div className="mt-10"><CalculatorGrid category="investment" /></div></main>; }
