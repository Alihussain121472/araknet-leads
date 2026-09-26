import { Brand } from '@/components/Brand';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100%', padding: '40px 20px', color: 'var(--text-primary)' }}>
      <header style={{ maxWidth: '680px', margin: '0 auto 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Brand />
        <Link href="/" className="auth-link">Back to home</Link>
      </header>
      <main style={{ maxWidth: '680px', margin: '0 auto', fontSize: '15px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '24px' }}>Terms of Service</h1>
        <p style={{ marginBottom: '16px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: '16px' }}>
          By accessing or using the Araknet platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
        </p>
        
        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>2. Description of Service</h2>
        <p style={{ marginBottom: '16px' }}>
          Araknet provides an AI-powered lead discovery and proposal generation tool for freelance developers and agencies. The service aggregates publicly available business data and assists in drafting outreach materials.
        </p>

        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>3. Acceptable Use</h2>
        <p style={{ marginBottom: '16px' }}>
          You agree to use the service only for lawful purposes. You must not use the service to send spam, distribute malicious software, or systematically scrape data in a manner that violates our rate limits or the terms of our third-party data providers.
        </p>

        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>4. API Usage and Limits</h2>
        <p style={{ marginBottom: '16px' }}>
          When providing your own API keys for third-party services (like Google Places or SerpAPI), you are solely responsible for compliance with their respective terms of service and for any associated usage costs or limits.
        </p>

        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>5. Limitation of Liability</h2>
        <p style={{ marginBottom: '16px' }}>
          Araknet shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
        </p>
      </main>
    </div>
  );
}
