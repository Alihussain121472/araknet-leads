'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to sign up');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-5 text-slate-900 dark:text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-5 shadow-2xl">
        <div>
          <p className="text-sm font-semibold text-cyan-400 tracking-wider">ARAKNET</p>
          <h1 className="mt-2 text-2xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Join the lead discovery platform.</p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </label>

        <button 
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-slate-900 dark:text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-center text-slate-500 dark:text-slate-400">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </div>
      </form>
    </main>
  );
}
