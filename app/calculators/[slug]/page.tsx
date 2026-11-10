import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdSlot } from '@/components/AdSlot';
import { FinanceCalculator } from '@/components/FinanceCalculator';
import { categoryLabels, calculators, getCalculator } from '@/lib/calculators';

export function generateStaticParams() {
  return calculators.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const calculator = getCalculator((await params).slug);
  return calculator ? { title: `Free Online ${calculator.title} | Araknet`, description: calculator.description } : {};
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const calculator = getCalculator((await params).slug);
  if (!calculator) notFound();
  const category = categoryLabels[calculator.category];
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12">
      <nav className="text-sm text-text-muted"><Link href="/">Home</Link> <span className="mx-2">/</span> <Link href={`/${calculator.category}`}>{category}</Link> <span className="mx-2">/</span> {calculator.shortTitle}</nav>
      <div className="mt-8 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-link">{category}</p><h1 className="mt-3 text-4xl font-bold md:text-5xl">{calculator.title}</h1><p className="mt-5 text-lg text-text-secondary">{calculator.description} Adjust the inputs below to see a transparent estimate instantly in your browser.</p></div>
      <AdSlot label="Advertisement" />
      <FinanceCalculator calculator={calculator} />
      <AdSlot label="Advertisement" />
      <article className="prose prose-invert mt-16 max-w-3xl text-text-secondary">
        <h2>How this calculator works</h2>
        <p>This free calculator gives you a useful planning baseline without requiring an account. It uses the values you enter locally in your browser and does not send your financial information to Araknet.</p>
        <h2>Understanding your result</h2>
        <p>Loan estimates use the standard amortizing payment formula. The principal is the amount borrowed, the annual rate is converted to a monthly rate, and the term is converted to monthly payments. A lender may quote a different result after fees, taxes, insurance, credit checks, or changing rates.</p>
        <h2>Tips for better decisions</h2>
        <p>Compare the total cost, not only the monthly payment. Check fees, make sure the payment fits your budget, and keep an emergency reserve. For investments, actual returns vary and past performance does not guarantee future results.</p>
        <h2>Frequently asked questions</h2>
        <h3>Are these figures financial advice?</h3><p>No. They are educational estimates, not an offer, guarantee, or formal financial advice.</p>
        <h3>Can I save my calculation?</h3><p>Bookmark this page or record the inputs. Your figures are not stored on our servers.</p>
      </article>
    </main>
  );
}
