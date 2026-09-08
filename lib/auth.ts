import 'server-only';
import { cookies, headers } from 'next/headers';
import { equalSecret, validBasic, validSession, SESSION_COOKIE } from './session';
export async function requireAccess() {
  const auth = (await headers()).get('authorization') || '';
  const password = process.env.DASHBOARD_PASSWORD || '';
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  const cron = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '';
  if (!validSession(session, password) && !validBasic(auth, password) && !equalSecret(auth, cron)) throw new Error('Authentication required');
}
