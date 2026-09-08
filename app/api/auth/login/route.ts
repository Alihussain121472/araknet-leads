import { NextRequest, NextResponse } from 'next/server';
import { createSession, equalSecret, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/session';
export async function POST(request: NextRequest) {
  let data: FormData;
  try { data = await request.formData(); } catch { return NextResponse.json({error: 'Invalid form'}, {status: 400}); }
  const password = process.env.DASHBOARD_PASSWORD || '';
  if (data.get('username') !== 'owner' || typeof data.get('password') !== 'string' || !equalSecret(String(data.get('password')), password)) {
    return NextResponse.redirect(new URL('/login?error=credentials', request.url), 303);
  }
  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.cookies.set(SESSION_COOKIE, createSession(password), { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
