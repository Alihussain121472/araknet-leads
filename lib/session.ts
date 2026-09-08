import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
export const SESSION_COOKIE = 'araknet_session';
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export function equalSecret(a: string, b: string) {
  return Boolean(b) && timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}
export function createSession(password: string, now = Date.now()) {
  const expires = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${expires}.${createHmac('sha256', password).update(`owner:${expires}`).digest('hex')}`;
}
export function validSession(token: string | undefined, password: string, now = Date.now()) {
  if (!token || !password) return false;
  const [expires, signature, extra] = token.split('.');
  if (extra || !/^\d+$/.test(expires) || Number(expires) <= now / 1000 || Number(expires) > now / 1000 + SESSION_SECONDS) return false;
  return equalSecret(signature || '', createHmac('sha256', password).update(`owner:${expires}`).digest('hex'));
}
export function validBasic(auth: string, password: string) {
  if (!password || !auth.startsWith('Basic ')) return false;
  return equalSecret(Buffer.from(auth.slice(6), 'base64').toString('utf8'), `owner:${password}`);
}
