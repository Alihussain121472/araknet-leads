import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) console.warn('WARNING: JWT_SECRET is missing.');
  return new TextEncoder().encode(secret || 'build_time_secret_do_not_use');
};

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authHeader = request.headers.get('authorization') || '';

  // 1. Allow cron
  const cronSecret = process.env.CRON_SECRET;
  const isCron =
    path === '/api/agent/run' &&
    request.method === 'GET' &&
    request.nextUrl.searchParams.get('schedule') === 'true' &&
    cronSecret != null &&
    authHeader === `Bearer ${cronSecret}`;
  if (isCron) return NextResponse.next();

  // 2. Extract and verify JWT
  const cookieVal = request.cookies.get('araknet_session')?.value;
  let payload = null;
  if (cookieVal) {
    try {
      const result = await jwtVerify(cookieVal, getJwtSecret());
      payload = result.payload;
    } catch (e) {
      // Invalid token
    }
  }

  const authenticated = !!payload;

  // 3. Public Routes
  if (
    path === '/api/auth/login' ||
    path === '/api/auth/signup' ||
    path === '/api/auth/logout' ||
    path.startsWith('/api/proposals') ||
    path === '/proposals'
  ) {
    return NextResponse.next();
  }

  // 4. Redirect logged-in users away from auth pages
  if (path === '/login' || path === '/signup') {
    return authenticated ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  }

  // 5. Protected Routes
  if (!authenticated) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. RBAC (Role-Based Access Control)
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    if (payload?.role !== 'admin') {
      if (path.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload?.sub as string);
  requestHeaders.set('x-user-role', payload?.role as string);

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
