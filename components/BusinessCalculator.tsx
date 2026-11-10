'use client';

import { useMemo, useState } from 'react';

type CalculatorKind = 'website' | 'marketing';

const websiteOptions = [
  ['Basic brochure site', 900],
  ['Lead-generation site', 1800],
  ['Online store', 3200],
];

export function BusinessCalculator({ kind }: { kind: CalculatorKind }) {
  const isWebsite = kind === 'website';
  const [choice, setChoice] = useState(isWebsite ? websiteOptions[0][0] : 'Build awareness');
  const [team, setTeam] = useState('Small business');
  const result = useMemo(() => {
    if (isWebsite) {
      const base = websiteOptions.find(([label]) => label === choice)?.[1] ?? 900;
      return { low: Number(base), high: Number(base) + (team === 'Growing business' ? 1400 : 800), label: 'project budget' };
    }
    const base = choice === 'Generate leads' ? 750 : choice === 'Increase sales' ? 1200 : 450;
    return { low: base, high: base + (team === 'Growing business' ? 650 : 350), label: 'monthly budget' };
  }, [choice, isWebsite, team]);

  return <div className="card max-w-xl p-6 md:p-8">
    <div className="grid gap-5">
      <label><span className="mb-2 block">{isWebsite ? 'What are you building?' : 'What is your main goal?'}</span><select className="form-control w-full px-3 py-3" value={choice} onChange={(event) => setChoice(event.target.value)}>{(isWebsite ? websiteOptions.map(([label]) => label) : ['Build awareness', 'Generate leads', 'Increase sales']).map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="mb-2 block">Business stage</span><select className="form-control w-full px-3 py-3" value={team} onChange={(event) => setTeam(event.target.value)}><option>Small business</option><option>Growing business</option></select></label>
    </div>
    <div className="mt-7 rounded-xl bg-brand-soft p-5"><p className="text-sm text-text-secondary">Recommended starting {result.label}</p><p className="mt-1 text-3xl font-bold text-brand-link">${result.low.toLocaleString()}–${result.high.toLocaleString()}</p><p className="mt-2 text-sm text-text-secondary">{isWebsite ? 'Your final cost depends on content, integrations, design, and ongoing support.' : 'Start with a budget you can sustain for at least three months, then measure results.'}</p></div>
  </div>;
}
