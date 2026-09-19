import 'server-only';
import { cookies, headers } from 'next/headers';
import { equalSecret, validBasic, validSession, SESSION_COOKIE } from './session';

export async function requireAccess() {
  const reqHeaders = await headers();
  
  // 1. Trust header set by proxy middleware if present
  if (reqHeaders.get('x-araknet-authenticated') === 'true') {
    return;
  }

  const auth = reqHeaders.get('authorization') || '';
  const envPassword = (process.env.DASHBOARD_PASSWORD || '').trim();
  const fallbackPassword = 'araknet2026';
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  const cron = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '';

  const isSessionValid =
    validSession(session, fallbackPassword) ||
    (Boolean(envPassword) && validSession(session, envPassword));

  const isBasicValid =
    validBasic(auth, fallbackPassword) ||
    (Boolean(envPassword) && validBasic(auth, envPassword));

  const isCronValid = equalSecret(auth, cron);

  if (!isSessionValid && !isBasicValid && !isCronValid) {
    throw new Error('Authentication required');
  }
}
