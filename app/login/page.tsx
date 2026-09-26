import type { Metadata } from 'next';
import { AuthShell } from '@/components/AuthShell';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Sign in | Araknet' };

const errors: Record<string, string> = {
  credentials: 'Incorrect email or password. Please try again.',
  unavailable: 'Sign-in is temporarily unavailable. Please try again shortly.',
  google: 'Google sign-in could not be completed. Please try again or use email.',
  existing: 'This email already has an account. Sign in with your password.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const query = await searchParams;
  return <AuthShell title="Welcome back" description="Sign in to your leads, research, and proposals.">
    <AuthForm mode="login" googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} initialError={query.error ? errors[query.error] || errors.google : ''} passwordReset={query.reset === 'success'} />
  </AuthShell>;
}
