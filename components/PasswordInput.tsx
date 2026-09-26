'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordInput({ id = 'password', label = 'Password', autoComplete = 'current-password', value, onChange, describedBy, minLength }: { id?: string; label?: string; autoComplete?: string; value?: string; onChange?: (value: string) => void; describedBy?: string; minLength?: number }) {
  const [visible, setVisible] = useState(false);
  return <div className="auth-field">
    <label htmlFor={id}>{label}</label>
    <div className="password-input">
      <input id={id} name={id} type={visible ? 'text' : 'password'} className="form-control" autoComplete={autoComplete} required minLength={minLength} maxLength={72} value={value} onChange={event => onChange?.(event.target.value)} aria-describedby={describedBy} />
      <button type="button" onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
    </div>
  </div>;
}
