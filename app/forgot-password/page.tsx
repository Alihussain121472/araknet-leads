import type { Metadata } from 'next';
import { AuthShell } from '@/components/AuthShell';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Reset Password | Araknet' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell 
      title="Reset your password" 
      description="Enter your email and we'll send you a reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
