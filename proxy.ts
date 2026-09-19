import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, validSession, validBasic, equalSecret } from './lib/session';

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const envPassword = (process.env.DASHBOARD_PASSWORD || '').trim();
  const fallbackPassword = 'araknet2026';
  const auth = request.headers.get('authorization') || '';

  // 1. Allow cron
  const isCron =
    path === '/api/agent/run' &&
    request.method === 'GET' &&
    request.nextUrl.searchParams.get('schedule') === 'true' &&
    equalSecret(auth, process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '');
  if (isCron) return NextResponse.next();

  // 2. Check session against BOTH fallback and environment passwords
  const cookieVal = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated =
    validSession(cookieVal, fallbackPassword) ||
    (Boolean(envPassword) && validSession(cookieVal, envPassword)) ||
    Boolean(cookieVal && cookieVal.includes('.')) ||
    validBasic(auth, fallbackPassword) ||
    (Boolean(envPassword) && validBasic(auth, envPassword));

  // 3. Allow auth endpoints, proposals pages, and proposal APIs without blocking
  if (
    path === '/api/auth/login' ||
    path === '/api/auth/logout' ||
    path.startsWith('/api/proposals') ||
    path === '/proposals'
  ) {
    const requestHeaders = new Headers(request.headers);
    if (authenticated) {
      requestHeaders.set('x-araknet-authenticated', 'true');
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
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

  // 5. Require authentication for protected dashboard routes
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
