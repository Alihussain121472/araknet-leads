import { NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return new NextResponse('Araknet setup in progress. Owner access has not been configured.', { status: 503 });
  const auth = request.headers.get('authorization');
  const isCron = request.nextUrl.pathname === '/api/agent/run' && request.method === 'GET' && request.nextUrl.searchParams.get('schedule') === 'true' && process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!isCron && auth !== `Basic ${btoa(`owner:${password}`)}`) return new NextResponse('Sign in with your Araknet owner credentials.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Araknet private dashboard", charset="UTF-8"', 'Cache-Control': 'no-store' } });
  if (!['GET','HEAD','OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (origin && origin !== request.nextUrl.origin) return new NextResponse('Invalid origin', { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
