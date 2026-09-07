import 'server-only';
import { headers } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';
export async function requireAccess() {
  const auth = (await headers()).get('authorization') || '';
  const expected = process.env.DASHBOARD_PASSWORD ? 'Basic ' + Buffer.from(`owner:${process.env.DASHBOARD_PASSWORD}`).toString('base64') : '';
  const cron = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '';
  const equal = (a: string, b: string) => Boolean(b) && timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
  if (!equal(auth, expected) && !equal(auth, cron)) throw new Error('Authentication required');
}
