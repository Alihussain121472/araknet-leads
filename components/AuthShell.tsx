import type { ReactNode } from 'react';
import { Brand } from './Brand';
import { TerminalDemo } from './TerminalDemo';
import { ThemeToggle } from './ThemeToggle';

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="auth-layout" id="main-content">
    <aside className="auth-story" aria-label="About Araknet">
      <Brand onDark />
      <div className="auth-story-content">
        <p className="auth-eyebrow">DISCOVER. UNDERSTAND. CONNECT.</p>
        <h2>Find your next<br className="hidden min-[1025px]:block" /> business opportunity.</h2>
        <p className="auth-story-description">Find local businesses, review their digital presence, and turn your research into a personal proposal.</p>
        <TerminalDemo />
      </div>
      <p className="auth-story-note">Built for freelance developers and agencies.</p>
    </aside>
    <section className="auth-form-panel" aria-labelledby="auth-title">
      <nav className="auth-toolbar" aria-label="Appearance"><ThemeToggle /></nav>
      <div className="auth-card">
        <h1 id="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </div>
    </section>
  </main>;
}
