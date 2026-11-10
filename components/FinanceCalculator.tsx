'use client';

import { useMemo, useState } from 'react';
import type { CalculatorDefinition } from '@/lib/calculators';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function FinanceCalculator({ calculator }: { calculator: CalculatorDefinition }) {
  const [values, setValues] = useState(() => Object.fromEntries(calculator.fields.map((field) => [field.key, field.value])));
  const result = useMemo(() => {
    const amount = values.amount;
    if (calculator.kind === 'compound') {
      const total = amount * Math.pow(1 + values.rate / 100, values.years);
      return { primary: total, interest: total - amount, label: 'Projected value', detail: `${values.years} years at ${values.rate}% annual return` };
    }
    if (calculator.kind === 'rate') {
      const total = amount / Math.max(values.years, 1) / Math.max(1 - values.rate / 100, 0.01);
      return { primary: total, interest: total - amount / Math.max(values.years, 1), label: 'Recommended rate', detail: 'A starting point to refine with your actual costs' };
    }
    const months = values.years * 12;
    const monthlyRate = values.rate / 100 / 12;
    const payment = monthlyRate === 0 ? amount / months : amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return { primary: payment, interest: payment * months - amount, label: 'Estimated monthly payment', detail: `${months} payments over ${values.years} years` };
  }, [calculator.kind, values]);

  function reset() {
    setValues(Object.fromEntries(calculator.fields.map((field) => [field.key, field.value])));
  }

  return (
    <section className="card grid gap-8 p-6 md:grid-cols-[1fr_0.85fr] md:p-8">
      <div className="space-y-6">
        {calculator.fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-2 flex justify-between text-sm font-medium"><span>{field.label}</span><span className="text-brand-link">{values[field.key].toLocaleString()} {field.suffix === '$' ? '' : field.suffix}</span></span>
            <input className="form-control mb-2 w-full px-3 py-2" type="number" min={field.min} max={field.max} step={field.step} value={values[field.key]} onChange={(event) => setValues({ ...values, [field.key]: Number(event.target.value) })} />
            <input className="w-full" type="range" min={field.min} max={field.max} step={field.step} value={values[field.key]} onChange={(event) => setValues({ ...values, [field.key]: Number(event.target.value) })} aria-label={field.label} />
          </label>
        ))}
        <button type="button" onClick={reset} className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold">Reset values</button>
      </div>
      <div className="rounded-2xl bg-brand-soft p-6">
        <p className="text-sm text-text-secondary">{result.label}</p>
        <p className="mt-2 text-4xl font-bold text-brand-link">{money.format(result.primary)}</p>
        <p className="mt-2 text-sm text-text-secondary">{result.detail}</p>
        <div className="mt-8 grid gap-4 border-t border-border-default pt-5 sm:grid-cols-2">
          <div><p className="text-xs uppercase tracking-wide text-text-muted">Principal / deposit</p><p className="mt-1 text-lg font-semibold">{money.format(amountFor(calculator, values))}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-text-muted">Interest / growth</p><p className="mt-1 text-lg font-semibold">{money.format(Math.max(result.interest, 0))}</p></div>
        </div>
      </div>
    </section>
  );
}

function amountFor(calculator: CalculatorDefinition, values: Record<string, number>) {
  return calculator.kind === 'rate' ? values.amount / Math.max(values.years, 1) : values.amount;
}
