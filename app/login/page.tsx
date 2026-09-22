import Link from 'next/link';
import { Terminal, Database, ShieldAlert, BarChart3 } from 'lucide-react';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  let errorMessage = '';
  if (error === 'credentials') {
    errorMessage = 'Incorrect email or password.';
  } else if (error) {
    errorMessage = 'Authentication error. Please try again.';
  }

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
                  <Database className="w-4 h-4 text-brand-primary dark:text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm">No manual prospecting.</h3>
                  <p className="text-sm mt-1 leading-relaxed">We scan local directories so you don't have to.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-[#1E293B] mt-1">
                  <ShieldAlert className="w-4 h-4 text-brand-primary dark:text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm">Built-in digital audits.</h3>
                  <p className="text-sm mt-1 leading-relaxed">We check their presence for missing websites or outdated platforms.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-[#1E293B] mt-1">
                  <BarChart3 className="w-4 h-4 text-brand-primary dark:text-[#0EA5E9]" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm">Know who to pitch.</h3>
                  <p className="text-sm mt-1 leading-relaxed">We score every business so you can contact the warmest leads first.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Mock Terminal Window */}
        <div className="relative z-10 mt-12 bg-slate-900 dark:bg-[#0B1120] border border-slate-800 dark:border-[#1E293B] rounded-lg p-4 font-mono text-[10px] text-slate-300 dark:text-[#94A3B8] shadow-2xl overflow-hidden">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          </div>
          <div className="text-brand-primary dark:text-[#0EA5E9] mb-1">$ araknet scan --city="Local" --industry="Clinics"</div>
          <div className="text-emerald-400">✔ Found 42 businesses</div>
          <div className="text-emerald-400">✔ Audited 38 websites</div>
          <div className="mt-2 text-slate-400 dark:text-slate-500">
            {`{`}
            <br />&nbsp;&nbsp;"business": "Downtown Dental",
            <br />&nbsp;&nbsp;"website_status": <span className="text-rose-400">"outdated"</span>,
            <br />&nbsp;&nbsp;"opportunity_score": <span className="text-amber-400">92</span>
            <br />{`}`}
          </div>
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
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Back to the hunt.</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#94A3B8]">Sign in to grab your latest local prospects and website audits.</p>
          </div>

          <form action="/api/auth/login" method="post" className="space-y-5">
            {errorMessage && (
              <div role="alert" className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {errorMessage}
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
                className="w-full rounded-md border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#111827] px-4 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#0EA5E9] focus:border-blue-500 dark:focus:border-[#0EA5E9] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 dark:text-[#94A3B8] uppercase">Password</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-md border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#111827] px-4 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#0EA5E9] focus:border-blue-500 dark:focus:border-[#0EA5E9] transition-all"
              />
            </div>

            <button className="w-full rounded-md bg-brand-primary dark:bg-[#0EA5E9] px-4 py-3 text-sm font-bold text-white dark:text-[#F8FAFC] hover:bg-blue-700 dark:hover:bg-[#0284C7] transition-all shadow-md dark:shadow-[0_0_15px_rgba(14,165,233,0.3)] active:scale-[0.98]">
              Access Dashboard
            </button>

            <div className="pt-6 border-t border-slate-200 dark:border-[#1E293B] text-center text-sm text-slate-500 dark:text-[#94A3B8]">
              Don't have an account? <Link href="/signup" className="text-blue-600 dark:text-[#0EA5E9] hover:text-blue-800 dark:hover:text-[#7DD3FC] transition-colors font-semibold">Start finding leads</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
