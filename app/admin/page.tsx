import { getAllUsers, getAdminStats } from '@/lib/storage';
import { requireAccess } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminDashboard() {
  const auth = await requireAccess();
  if (auth.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  const users = await getAllUsers();
  const stats = await getAdminStats();

  return (
    <main className="min-h-screen bg-page text-text-primary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">System Admin Dashboard</h1>
            <p className="text-sm text-text-secondary">Manage all users and monitor platform usage.</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">
            Back to App
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-card border border-border-default p-6 rounded-2xl shadow-xl">
            <h3 className="text-text-secondary font-medium">Total Registered Users</h3>
            <p className="text-3xl font-bold text-text-primary mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-card border border-border-default p-6 rounded-2xl shadow-xl">
            <h3 className="text-text-secondary font-medium">System-Wide Leads Discovered</h3>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{stats.totalLeadsSystemWide}</p>
          </div>
          <div className="bg-card border border-border-default p-6 rounded-2xl shadow-xl">
            <h3 className="text-text-secondary font-medium">System-Wide Agent Runs</h3>
            <p className="text-3xl font-bold text-amber-400 mt-2">{stats.totalRunsSystemWide}</p>
          </div>
        </div>

        <div className="bg-card border border-border-default rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-page text-text-secondary text-sm">
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/50">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-text-primary'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
