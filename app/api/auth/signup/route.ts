import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { hashPassword, signToken } from '@/lib/auth';
import { createUser, getUserByEmail, getAllUsers } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Valid email and minimum 6 character password required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await getUserByEmail(cleanEmail);
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const allUsers = await getAllUsers();
    
    // First user is automatically admin, OR matches env ADMIN_EMAIL
    let role: 'admin' | 'user' = 'user';
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (allUsers.length === 0 || (adminEmail && cleanEmail === adminEmail)) {
      role = 'admin';
    }

    const hashedPassword = await hashPassword(password);
    const userId = randomUUID();

    const newUser = {
      id: userId,
      email: cleanEmail,
      password_hash: hashedPassword,
      role,
      created_at: new Date().toISOString()
    };

    await createUser(newUser);

    const token = await signToken({
      sub: userId,
      email: cleanEmail,
      role
    });

    const response = NextResponse.json({ success: true, redirect: '/' });
    response.cookies.set('araknet_session', token, {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
