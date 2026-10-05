import { ReactNode } from 'react';
import { AlertCircle, Lock } from 'lucide-react';

/** The storefront's text input style: 52px tall, 16px text so iOS never zooms. */
export const INPUT_CLASS =
  'w-full min-h-[52px] px-4 rounded-2xl border border-ink/15 bg-white text-base text-ink placeholder:text-ink/45 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 aria-[invalid=true]:border-clay-700 [&[readonly]]:bg-ink/5 [&[readonly]]:text-ink/70';

export interface FieldControlProps {
  id: string;
  className: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  locked?: boolean;
  /** Multi-line controls get vertical padding instead of a fixed height feel. */
  multiline?: boolean;
  children: (props: FieldControlProps) => ReactNode;
}

/** A labelled control with its hint and error wired up for screen readers. */
export default function Field({ id, label, hint, error, optional, locked, multiline, children }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-ink/70">(optional)</span>}
        {locked && <Lock className="w-3.5 h-3.5 text-ink/60" aria-hidden />}
      </label>
      <div className="mt-2">
        {children({
          id,
          className: `${INPUT_CLASS} ${multiline ? 'py-3 resize-none' : ''}`,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-ink/70">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-clay-800">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
