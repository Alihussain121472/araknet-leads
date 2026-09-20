import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/storage';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let email, password;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      const data = await request.formData();
      email = data.get('email');
      password = data.get('password');
    }
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (!email || !password) {
    if (request.headers.get('accept')?.includes('json')) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/login?error=credentials', request.url), 303);
  }

  const user = await getUserByEmail(String(email).trim().toLowerCase());
  
  if (!user || !(await comparePassword(String(password), user.password_hash))) {
    if (request.headers.get('accept')?.includes('json')) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login?error=credentials', request.url), 303);
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  const response = request.headers.get('accept')?.includes('json') 
    ? NextResponse.json({ success: true, redirect: '/' }) 
    : NextResponse.redirect(new URL('/', request.url), 303);

  response.cookies.set('araknet_session', token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.headers.set('Cache-Control', 'no-store');
  
  return response;
}
