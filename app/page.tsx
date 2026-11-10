import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { CalculatorGrid } from '@/components/CalculatorGrid';

export const metadata: Metadata = {
  title: 'Free Loan, Mortgage and Business Calculators | Araknet',
  description: 'Free online calculators for loans, mortgages, business finance, investing, and agency planning.',
  alternates: { canonical: 'https://araknet.tech/' },
};

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-border-default bg-page/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="brand-mark"><Sparkles className="h-4 w-4" /></span> Araknet
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex">
            <Link href="/loans" className="hover:text-brand-link">Loans</Link>
            <Link href="/mortgage" className="hover:text-brand-link">Mortgage</Link>
            <Link href="/business-finance" className="hover:text-brand-link">Business finance</Link>
            <Link href="/investment" className="hover:text-brand-link">Investment</Link>
            <Link href="/app" className="hover:text-brand-link">Agency portal</Link>
          </nav>
          <a href="#calculators" className="btn-primary rounded-lg px-3 py-2 text-sm font-semibold md:hidden">Explore calculators</a>
        </div>
      </header>

      <section className="discovery-banner border-b border-border-default">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Free financial tools for real decisions</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">Understand the numbers before you commit.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">Estimate loan payments, compare mortgage costs, plan your freelance rate, and model investment growth with simple calculators that work instantly.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#calculators" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold">Explore calculators <ArrowRight className="h-4 w-4" /></a>
              <a href="/app" className="btn-ghost inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold">Agency portal</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-text-secondary">
              {['No signup', 'Runs in your browser', 'Educational estimates'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-emerald" />{item}</span>)}
            </div>
          </div>
          <div className="card p-6 md:p-8"><div className="flex items-center gap-3"><span className="brand-mark"><Calculator className="h-4 w-4" /></span><div><p className="font-semibold">Quick loan estimate</p><p className="text-sm text-text-secondary">Start with a clear monthly baseline.</p></div></div><div className="mt-7 rounded-xl bg-brand-soft p-5"><p className="text-sm text-text-secondary">Example monthly payment</p><p className="mt-2 text-4xl font-bold text-brand-link">$500</p><p className="mt-2 text-sm text-text-secondary">Illustration only. Open a calculator for your numbers.</p></div><Link href="/calculators/personal-loan-emi-calculator" className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold">Calculate your payment <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <AdSlot />

      <section id="calculators" className="mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">Start here</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Calculators for loans, homes, work, and wealth</h2><p className="mt-4 text-text-secondary">Transparent assumptions and instant results, so you can ask better questions before making a financial decision.</p></div>
        <div className="mt-10"><CalculatorGrid /></div>
      </section>

      <section className="border-y border-border-default bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-3">
          {[['01', 'Choose a tool', 'Start with the question you need to answer today.'], ['02', 'Adjust the assumptions', 'Change rates, terms, and amounts to see how the result moves.'], ['03', 'Use the baseline wisely', 'Take the estimate to a lender, accountant, or adviser for context.']].map(([number, title, description]) => <div key={number}><span className="text-sm font-bold text-brand-link">{number}</span><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-2 text-text-secondary">{description}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-accent-emerald" /><h2 className="mt-4 text-3xl font-bold">Built for clarity, not certainty</h2><p className="mx-auto mt-4 max-w-2xl text-text-secondary">Araknet calculators are educational planning tools. They are not financial, tax, investment, or legal advice, and they never replace professional guidance.</p><a href="/disclaimer" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold">Read our disclaimer <ArrowRight className="h-4 w-4" /></a></section>
    </main>
  );
}
