import { Star } from 'lucide-react';

/** A row of five stars. Decorative: always pair it with the rating in text. */
export default function Stars({ rating, className = 'w-4 h-4' }: { rating: number; className?: string }) {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= Math.round(rating) ? 'text-accent-500' : 'text-ink/15'}`}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </span>
  );
}
