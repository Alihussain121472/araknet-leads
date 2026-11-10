import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categoryLabels, calculators, type CalculatorCategory } from '@/lib/calculators';

export function CalculatorGrid({ category }: { category?: CalculatorCategory }) {
  const items = category ? calculators.filter((calculator) => calculator.category === category) : calculators;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((calculator) => <Link key={calculator.slug} href={`/calculators/${calculator.slug}`} className="card group p-6 transition hover:-translate-y-1 hover:border-brand-primary"><p className="text-xs font-bold uppercase tracking-wide text-brand-link">{categoryLabels[calculator.category]}</p><h2 className="mt-3 text-xl font-semibold">{calculator.title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{calculator.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-link">Open calculator <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div>;
}
