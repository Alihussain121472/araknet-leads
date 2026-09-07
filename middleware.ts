import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const password = process.env.DASHBOARD_PASSWORD;

    // If password is not configured yet, do not crash
    if (!password) {
      return NextResponse.next();
    }

    const auth = request.headers.get('authorization');
    const isCron =
      request.nextUrl.pathname === '/api/agent/run' &&
      request.method === 'GET' &&
      request.nextUrl.searchParams.get('schedule') === 'true' &&
      process.env.CRON_SECRET &&
      auth === `Bearer ${process.env.CRON_SECRET}`;

    if (isCron) {
      return NextResponse.next();
    }

    // Check Basic Authentication safely
    let isAuthenticated = false;
    if (auth && auth.startsWith('Basic ')) {
      try {
        const base64Token = auth.slice(6).trim();
        const decoded = atob(base64Token);
        const sepIndex = decoded.indexOf(':');
        if (sepIndex !== -1) {
          const user = decoded.slice(0, sepIndex);
          const pwd = decoded.slice(sepIndex + 1);
          if (user === 'owner' && pwd === password) {
            isAuthenticated = true;
          }
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      return new Response('Sign in with your Araknet owner credentials.', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Araknet Dashboard"',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // Origin validation for non-GET requests
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const origin = request.headers.get('origin');
      if (origin && origin !== request.nextUrl.origin) {
        return new Response('Invalid origin', { status: 403 });
      }
    }

    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  } catch (err) {
    console.error('Middleware execution caught error:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
