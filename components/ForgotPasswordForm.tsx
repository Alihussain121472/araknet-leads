'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (caught) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-form">
        <p className="auth-success" role="status">
          Check your inbox ? we sent a link to {email}
        </p>
        <Link href="/login" className="btn-ghost auth-submit" style={{ textDecoration: 'none' }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="auth-form" aria-busy={loading}>
      <div className="auth-field">
        <label htmlFor="email">Email address</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          autoComplete="email" 
          className="form-control" 
          placeholder="you@company.com" 
          required 
          maxLength={254} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button className="btn-primary auth-submit" type="submit" disabled={loading}>
        {loading ? (
          <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Sending...</>
        ) : (
          <>Send Reset Link <ArrowRight size={18} aria-hidden="true" /></>
        )}
      </button>
      <div className="auth-switch">
        <Link className="auth-link" href="/login">Back to login</Link>
      </div>
    </form>
  );
}
