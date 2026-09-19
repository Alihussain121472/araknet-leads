import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, validSession, validBasic, equalSecret } from './lib/session';

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const envPassword = (process.env.DASHBOARD_PASSWORD || '').trim();
  const password = envPassword || 'araknet2026';
  const auth = request.headers.get('authorization') || '';

  // 1. Allow cron
  const isCron =
    path === '/api/agent/run' &&
    request.method === 'GET' &&
    request.nextUrl.searchParams.get('schedule') === 'true' &&
    equalSecret(auth, process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '');
  if (isCron) return NextResponse.next();

  // 2. Check session
  const authenticated =
    validSession(request.cookies.get(SESSION_COOKIE)?.value, password) ||
    (Boolean(envPassword) && validSession(request.cookies.get(SESSION_COOKIE)?.value, envPassword)) ||
    validBasic(auth, password);

  // 3. Allow auth endpoints and login page unconditionally
  if (path === '/api/auth/login' || path === '/api/auth/logout') {
    return NextResponse.next();
  }

  if (path === '/login') {
    return authenticated ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  }

  // 4. Origin validation for state-modifying requests
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    let validOrigin = true;
    try {
      if (origin && host) {
        const originHost = new URL(origin).host;
        validOrigin =
          originHost === host ||
          originHost.replace(/^www\./, '') === host.replace(/^www\./, '');
      }
    } catch {
      validOrigin = false;
    }
    if (!validOrigin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  // 5. Require authentication for all protected routes
  if (!authenticated) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-araknet-authenticated', 'true');

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'] };
