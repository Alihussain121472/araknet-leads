import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true, redirect: '/login' });
  response.cookies.set('araknet_session', '', {
    httpOnly: true,
    secure: new URL(request.url).protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
