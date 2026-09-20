import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface JWTPayload {
  sub: string;
  email: string;
  role: 'admin' | 'user';
  exp?: number;
  iat?: number;
}

export async function signToken(payload: Omit<JWTPayload, 'exp' | 'iat'>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
