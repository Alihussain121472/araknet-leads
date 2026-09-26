'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, Database, ShieldAlert, BarChart3 } from 'lucide-react';

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
    <main className="min-h-screen flex flex-col md:flex-row font-sans bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-[#F8FAFC]">
      {/* Left Panel: Value Prop & Trust Signals */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-[#1E293B] relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-600 dark:text-[#0EA5E9] font-mono text-xl tracking-wider font-bold">
            <Terminal className="w-6 h-6" />
            <span>&gt; ARAKNET<span className="animate-pulse">_</span></span>
          </div>

          <div className="mt-24 space-y-8 max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Stop guessing who needs your services.</h2>
            
            <ul className="space-y-6 text-slate-600 dark:text-[#94A3B8]">
              <li className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-[#1E293B] mt-1">
                  <Database className="w-4 h-4 text-brand-link dark:text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm">No manual prospecting.</h3>
                  <p className="text-sm mt-1 leading-relaxed">We scan local directories so you don't have to.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-[#1E293B] mt-1">
                  <ShieldAlert className="w-4 h-4 text-brand-link dark:text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm">Built-in digital audits.</h3>
                  <p className="text-sm mt-1 leading-relaxed">We check their presence for missing websites or outdated platforms.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-[#1E293B] mt-1">
                  <BarChart3 className="w-4 h-4 text-brand-link dark:text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm">Know who to pitch.</h3>
                  <p className="text-sm mt-1 leading-relaxed">We score every business so you can contact the warmest leads first.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-12 rounded-lg border border-border-default bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">A workspace built around your data</p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            Your account starts empty. After you choose a market and run a search, only the results saved to your workspace appear in the dashboard.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">
            We do not display prefilled businesses, scores, or activity examples.
          </p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Mobile-only logo */}
          <div className="md:hidden flex items-center gap-2 text-blue-600 dark:text-[#0EA5E9] font-mono text-xl tracking-wider font-bold mb-8">
            <Terminal className="w-6 h-6" />
            <span>&gt; ARAKNET<span className="animate-pulse">_</span></span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Find your next client today.</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#94A3B8]">Enter a city, pick an industry, and get a prioritized list of businesses that need your help.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-accent-rose text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 dark:text-[#94A3B8] uppercase">Email Address</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="form-control w-full rounded-lg px-4 py-2.5 text-sm transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 dark:text-[#94A3B8] uppercase">Password</label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="form-control w-full rounded-lg px-4 py-2.5 text-sm transition-colors"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full rounded-md bg-brand-primary px-4 py-3 text-sm font-bold text-white dark:text-[#F8FAFC] hover:bg-blue-700  transition-all shadow-md dark:shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? 'Creating account...' : 'Start finding leads'}
            </button>

            <div className="pt-6 border-t border-slate-200 dark:border-[#1E293B] text-center text-sm text-slate-500 dark:text-[#94A3B8]">
              Already have an account? <Link href="/login" className="text-blue-600 dark:text-[#0EA5E9] hover:text-blue-800 dark:hover:text-[#7DD3FC] transition-colors font-semibold">Access Dashboard</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
