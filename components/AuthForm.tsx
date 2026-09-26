'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { GoogleButton } from './GoogleButton';
import { passwordError } from '@/lib/password-policy';

export function AuthForm({ mode, googleEnabled = false, initialError = '', passwordReset = false }: { mode: 'login' | 'signup'; googleEnabled?: boolean; initialError?: string; passwordReset?: boolean }) {
  const signup = mode === 'signup';
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    setError('');
    if (signup) {
      const invalid = passwordError(password);
      if (invalid) { setError(invalid); return; }
      if (password !== form.get('confirm-password')) { setError('Your passwords do not match.'); return; }
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: form.get('email'), password }), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not complete your request. Please try again.');
      window.location.assign('/');
    } catch (caught) {
      setError(caught instanceof Error && caught.name !== 'TimeoutError' ? caught.message : 'The request timed out. Please try again.');
      setLoading(false);
    }
  }

  return <>
    <GoogleButton enabled={googleEnabled} />
    <div className="auth-divider"><span>or continue with email</span></div>
    {passwordReset && <p className="auth-success" role="status">Your password has been changed. Sign in with your new password.</p>}
    <form onSubmit={submit} className="auth-form" aria-busy={loading}>
      <div className="auth-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" className="form-control" placeholder="you@company.com" required maxLength={254} /></div>
      <PasswordInput value={password} onChange={setPassword} autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} describedBy={signup ? 'password-hint password-strength' : undefined} />
      {signup ? <><PasswordStrength password={password} /><p id="password-hint" className="auth-help">Use at least 8 characters. A mix of uppercase and lowercase letters, numbers, and symbols is stronger.</p><PasswordInput id="confirm-password" label="Confirm password" autoComplete="new-password" /></> : <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button className="btn-primary auth-submit" type="submit" disabled={loading}>{loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />{signup ? 'Creating account…' : 'Signing in…'}</> : <>{signup ? 'Create account' : 'Sign in'}<ArrowRight size={18} aria-hidden="true" /></>}</button>
      {signup && <p className="auth-help text-center">By creating an account, you agree to our <Link className="auth-link" href="/terms">Terms of Service</Link> and acknowledge our <Link className="auth-link" href="/privacy">Privacy Policy</Link>.</p>}
    </form>
    <p className="auth-switch">{signup ? 'Already have an account?' : 'New to Araknet?'} <Link className="auth-link" href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p>
  </>;
}
