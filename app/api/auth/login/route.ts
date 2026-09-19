import { NextRequest, NextResponse } from 'next/server';
import { createSession, equalSecret, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/session';

export async function POST(request: NextRequest) {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 });
  }

  const password = (process.env.DASHBOARD_PASSWORD || '').trim();
  if (!password) {
    return NextResponse.redirect(new URL('/login?error=not_configured', request.url), 303);
  }

  const enteredUser = String(data.get('username') || '').trim().toLowerCase();
  const enteredPass = String(data.get('password') || '').trim();

  const validUsers = ['owner', 'alihussain121472', 'syedali6160@gmail.com'];
  const userMatches = validUsers.includes(enteredUser);

  const passwordMatches =
    equalSecret(enteredPass, password) ||
    equalSecret(enteredPass, password.replace(/\r?\n/g, ''));

  if (!userMatches || !passwordMatches) {
    return NextResponse.redirect(new URL('/login?error=credentials', request.url), 303);
  }

  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.cookies.set(SESSION_COOKIE, createSession(password), {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
