import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, validSession, validBasic, equalSecret } from './lib/session';
export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const password = process.env.DASHBOARD_PASSWORD || '';
  const auth = request.headers.get('authorization') || '';
  const isCron = path === '/api/agent/run' && request.method === 'GET' && request.nextUrl.searchParams.get('schedule') === 'true' && equalSecret(auth, process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '');
  if (isCron) return NextResponse.next();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    let validOrigin = true;
    try { if (origin) validOrigin = new URL(origin).host === request.headers.get('host'); } catch { validOrigin = false; }
    if (!validOrigin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  if (!password) return NextResponse.json({ error: 'Dashboard access is not configured. Set DASHBOARD_PASSWORD in Vercel.' }, { status: 503 });
  const authenticated = validSession(request.cookies.get(SESSION_COOKIE)?.value, password) || validBasic(auth, password);
  if (path === '/api/auth/login' || path === '/api/auth/logout') return NextResponse.next();
  if (path === '/login') return authenticated ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  if (!authenticated) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url));
  }
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'] };
