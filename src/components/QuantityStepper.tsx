import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  /** Names the group for screen readers, e.g. "Quantity of Hand Wash". */
  label?: string;
  /** `lg` matches the 52px buttons it sits beside in buy bars. */
  size?: 'md' | 'lg';
}

export default function QuantityStepper({ value, onChange, max = 99, label = 'Quantity', size = 'lg' }: QuantityStepperProps) {
  const height = size === 'lg' ? 'h-[50px]' : 'h-[42px]';
  const button = `w-11 ${height} grid place-items-center text-ink disabled:text-ink/30 hover:bg-surface transition-colors`;

  return (
    <div role="group" aria-label={label} className="shrink-0 flex items-center rounded-full border border-ink/15 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className={`${button} rounded-l-full`}
      >
        <Minus className="w-4 h-4" aria-hidden />
      </button>
      <span className="w-7 text-center font-semibold text-ink tabular" aria-live="polite">
        <span className="sr-only">Quantity </span>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={`${button} rounded-r-full`}
      >
        <Plus className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}
