import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Field from './Field';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  hint?: string;
  error?: string;
}

/** A password input with a show/hide toggle, which matters most when typing on a phone. */
export default function PasswordField({ id, label, value, onChange, autoComplete, hint, error }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      {(props) => (
        <div className="relative">
          <input
            {...props}
            type={visible ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${props.className} pr-14`}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full text-ink/60 hover:text-ink transition-colors"
          >
            {visible ? <EyeOff className="w-5 h-5" aria-hidden /> : <Eye className="w-5 h-5" aria-hidden />}
          </button>
        </div>
      )}
    </Field>
  );
}
