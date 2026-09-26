'use client';

import { useEffect, useState } from 'react';
import { Pause, Play, Terminal } from 'lucide-react';

const lines = [
  { text: '$ Start with your city and industry', color: 'terminal-prompt' },
  { text: '> Discover businesses from live sources', color: 'terminal-dim' },
  { text: '> Review their digital presence', color: 'terminal-dim' },
  { text: '> Draft a proposal from your findings', color: 'terminal-dim' },
  { text: '✓ Your next opportunity starts with a search', color: 'terminal-success' },
];
const totalCharacters = lines.reduce((total, line) => total + line.text.length, 0);

export function TerminalDemo() {
  const [characters, setCharacters] = useState(totalCharacters);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReducedMotion(preference.matches); setCharacters(preference.matches ? totalCharacters : 0); };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion) return;
    // One timeout at a time avoids overlapping loops when the user pauses.
    const timer = window.setTimeout(() => setCharacters(value => value === totalCharacters ? 0 : value + 1), characters === totalCharacters ? 3000 : 28);
    return () => window.clearTimeout(timer);
  }, [characters, paused, reducedMotion]);

  let remaining = characters;
  return (
    <section className="terminal-demo" aria-label="A preview of the Araknet workflow">
      <div className="terminal-titlebar">
        <span className="flex items-center gap-2"><Terminal size={16} aria-hidden="true" /> Workflow preview</span>
        {!reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} className="terminal-pause" aria-label={paused ? 'Play workflow animation' : 'Pause workflow animation'}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
      </div>
      <p className="sr-only">Choose a city and industry, discover businesses, review their digital presence, and draft a proposal. This illustration contains no search results.</p>
      <div className="terminal-lines" aria-hidden="true">
        {lines.map((line, index) => {
          const visible = Math.max(0, Math.min(remaining, line.text.length));
          const cursor = remaining >= 0 && (remaining < line.text.length || index === lines.length - 1);
          remaining -= line.text.length;
          return <div key={line.text} className={line.color}>{line.text.slice(0, visible)}{cursor && <span className={paused || reducedMotion ? '' : 'terminal-cursor'}>█</span>}</div>;
        })}
      </div>
      <p className="terminal-caption">Workflow illustration · Your results appear after you run a search.</p>
    </section>
  );
}
