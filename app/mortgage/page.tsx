import type { Metadata } from 'next';
import { CalculatorGrid } from '@/components/CalculatorGrid';
export const metadata: Metadata = { title: 'Mortgage Calculators | Araknet', description: 'Free mortgage and refinance calculators for home buyers.' };
export default function MortgagePage() { return <main className="mx-auto max-w-7xl px-5 py-16"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Mortgage</p><h1 className="mt-3 text-4xl font-bold">Mortgage & real estate calculators</h1><p className="mt-4 max-w-2xl text-lg text-text-secondary">Explore home payment and refinance estimates with transparent assumptions.</p><div className="mt-10"><CalculatorGrid category="mortgage" /></div></main>; }
