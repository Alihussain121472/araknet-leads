import { Brand } from '@/components/Brand';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100%', padding: '40px 20px', color: 'var(--text-primary)' }}>
      <header style={{ maxWidth: '680px', margin: '0 auto 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Brand />
        <Link href="/" className="auth-link">Back to home</Link>
      </header>
      <main style={{ maxWidth: '680px', margin: '0 auto', fontSize: '15px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '24px' }}>Privacy Policy</h1>
        <p style={{ marginBottom: '16px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>1. Information We Collect</h2>
        <p style={{ marginBottom: '16px' }}>
          We collect information that you provide directly to us, including when you create an account, update your profile, or use our lead discovery and proposal generation services. This may include your name, email address, and professional details.
        </p>
        
        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>2. How We Use Your Information</h2>
        <p style={{ marginBottom: '16px' }}>
          We use the information we collect to provide, maintain, and improve our services. This includes authenticating your account, saving your generated proposals, and analyzing usage patterns to optimize our AI lead discovery algorithms.
        </p>

        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>3. Data Security</h2>
        <p style={{ marginBottom: '16px' }}>
          We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or electronic storage is completely secure.
        </p>

        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>4. Third-Party Services</h2>
        <p style={{ marginBottom: '16px' }}>
          Our application integrates with third-party APIs (such as Google Places and SerpAPI) to discover business leads. We do not share your personal account information with these services, but your search queries are processed by them to return results.
        </p>

        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>5. Contact Us</h2>
        <p style={{ marginBottom: '16px' }}>
          If you have any questions about this Privacy Policy, please contact us at privacy@araknet.tech.
        </p>
      </main>
    </div>
  );
}
