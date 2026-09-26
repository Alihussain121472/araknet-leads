import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-default)',
      padding: '24px 32px',
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        <Link href="/privacy" className="auth-link" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
        <Link href="/terms" className="auth-link" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
      </div>
      <div>&copy; {new Date().getFullYear()} Araknet. All rights reserved.</div>
    </footer>
  );
}
