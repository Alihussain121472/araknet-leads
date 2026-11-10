'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Calculator, RotateCcw } from 'lucide-react';

const fields = [
  { id: 'type', label: 'Business type', options: ['Service business', 'Retail store', 'Restaurant', 'Professional practice'] },
  { id: 'size', label: 'Business size', options: ['Just starting', 'Growing team', 'Established business'] },
];

export function PublicGrowthHub() {
  const [values, setValues] = useState({ type: fields[0].options[0], size: fields[1].options[0] });
  const [showResult, setShowResult] = useState(false);
  const estimate = useMemo(() => {
    const typeAdjustment = values.type === 'Restaurant' ? 350 : values.type === 'Professional practice' ? 250 : 0;
    const sizeAdjustment = values.size === 'Established business' ? 600 : values.size === 'Growing team' ? 300 : 0;
    return 900 + typeAdjustment + sizeAdjustment;
  }, [values]);

  return (
    <div className="card mx-auto w-full max-w-md p-6 shadow-2xl shadow-blue-950/10">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-brand-soft p-3 text-brand-link"><Calculator className="h-5 w-5" /></span><div><p className="text-sm font-semibold">Quick website budget estimate</p><p className="text-xs text-text-muted">A useful starting point, not a quote</p></div></div>
      <div className="mt-6 space-y-4">
        {fields.map((field) => <label key={field.id} className="block"><span className="mb-2 block">{field.label}</span><select className="form-control w-full px-3 py-2.5 text-sm" value={values[field.id as keyof typeof values]} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}>{field.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}
      </div>
      {showResult ? <div className="mt-5 rounded-xl bg-brand-soft p-4"><p className="text-sm text-text-secondary">Typical starting range</p><p className="mt-1 text-3xl font-bold text-brand-link">${estimate.toLocaleString()}–${(estimate + 1600).toLocaleString()}</p><p className="mt-2 text-xs text-text-secondary">Get the full breakdown and cost factors in the calculator.</p><button onClick={() => setShowResult(false)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-link"><RotateCcw className="h-3.5 w-3.5" /> Adjust estimate</button></div> : <button onClick={() => setShowResult(true)} className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold">Show my estimate <ArrowRight className="h-4 w-4" /></button>}
      <p className="mt-4 text-center text-xs text-text-muted">Free to use. No email required.</p>
    </div>
  );
}
