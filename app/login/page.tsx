export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="min-h-screen flex items-center justify-center bg-slate-950 px-5 text-slate-100">
    <form action="/api/auth/login" method="post" className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 space-y-5">
      <div><p className="text-sm font-semibold text-cyan-400">ARAKNET</p><h1 className="mt-2 text-2xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Sign in to your business discovery dashboard.</p></div>
      {error && <p role="alert" className="text-sm text-rose-400">Incorrect username or password. Please try again.</p>}
      <label className="block text-sm">Username<input name="username" autoComplete="username" defaultValue="owner" required className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
      <label className="block text-sm">Password<input name="password" type="password" autoComplete="current-password" required maxLength={1024} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" /></label>
      <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-500">Sign in</button>
      <p className="text-xs text-slate-500">Use the dashboard password configured by the project owner.</p>
    </form>
  </main>;
}
