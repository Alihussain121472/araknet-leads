export function passwordStrength(password: string) {
  if (!password) return 0;
  if (password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9\s]/.test(password)) return 4;
  if (password.length >= 8 && /[\d\W_]/.test(password)) return 3;
  return password.length >= 8 ? 2 : 1;
}

export function passwordError(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < 8) return 'Use at least 8 characters for your password.';
  // bcrypt only uses the first 72 bytes, which can be fewer than 72 Unicode characters.
  if (new TextEncoder().encode(password).length > 72) return 'Choose a shorter password (at most 72 UTF-8 bytes).';
  return null;
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
