import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// We fall back to an empty string during build time so Next.js doesn't crash during route collection.
// We will explicitly check for it inside the actual auth functions at runtime.
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.warn('WARNING: JWT_SECRET is missing. Authentication will fail.');
  }
  return new TextEncoder().encode(secret || 'build_time_secret_do_not_use');
};

export interface JWTPayload {
  sub: string;
  email: string;
  role: 'admin' | 'user';
  exp?: number;
  iat?: number;
}

export async function signToken(payload: Omit<JWTPayload, 'exp' | 'iat'>) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is missing.');
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is missing.');
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function requireAccess(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('araknet_session')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyToken(token);
  if (!payload) throw new Error('Unauthorized');
  return payload;
}
