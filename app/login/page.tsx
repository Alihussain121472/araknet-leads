export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  let errorMessage = '';
  if (error === 'credentials') {
    errorMessage = 'Incorrect password. Make sure username is "owner" and check for caps or typos.';
  } else if (error === 'not_configured') {
    errorMessage = 'DASHBOARD_PASSWORD is not set in Vercel Production Environment Variables.';
  } else if (error) {
    errorMessage = 'Authentication error. Please try again.';
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-5 text-slate-100">
      <form action="/api/auth/login" method="post" className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 space-y-5 shadow-2xl">
        <div>
          <p className="text-sm font-semibold text-cyan-400 tracking-wider">ARAKNET</p>
          <h1 className="mt-2 text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to your business discovery dashboard.</p>
        </div>

        {errorMessage && (
          <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <label className="block text-sm">
          Username
          <input
            name="username"
            autoComplete="username"
            defaultValue="owner"
            required
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={1024}
            placeholder="Enter DASHBOARD_PASSWORD"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </label>

        <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30">
          Sign in
        </button>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <p>• Username: <span className="text-slate-300 font-mono">owner</span> (or your email)</p>
          <p>• Password: configured via <span className="text-slate-300 font-mono">DASHBOARD_PASSWORD</span> in Vercel.</p>
        </div>
      </form>
    </main>
  );
}
