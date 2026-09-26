import { passwordStrength } from '@/lib/password-policy';

export function PasswordStrength({ password }: { password: string }) {
  const strength = passwordStrength(password);
  const label = ['Not entered', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  return <div className="password-strength" id="password-strength">
    <div role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength} aria-valuetext={label} className="strength-segments">
      {[1, 2, 3, 4].map(segment => <span key={segment} className={strength >= segment ? `strength-${segment}` : ''} />)}
    </div>
    <span>{label}</span>
  </div>;
}
