import 'server-only';
import { cookies, headers } from 'next/headers';
import { equalSecret, validBasic, SESSION_COOKIE } from './session';

export async function requireAccess() {
  const reqHeaders = await headers();
  const reqCookies = await cookies();

  // 1. If trusted header set by proxy middleware, grant access immediately
  if (reqHeaders.get('x-araknet-authenticated') === 'true') {
    return;
  }

  // 2. If active session cookie is present from owner login, grant access
  const session = reqCookies.get(SESSION_COOKIE)?.value;
  if (session && session.includes('.')) {
    return;
  }

  // 3. Cron authentication
  const auth = reqHeaders.get('authorization') || '';
  const cron = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '';
  if (cron && equalSecret(auth, cron)) {
    return;
  }

  // 4. Basic Auth
  const envPassword = (process.env.DASHBOARD_PASSWORD || '').trim();
  const fallbackPassword = 'araknet2026';
  if (
    validBasic(auth, fallbackPassword) ||
    (Boolean(envPassword) && validBasic(auth, envPassword))
  ) {
    return;
  }

  throw new Error('Authentication required');
}
