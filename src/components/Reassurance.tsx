import { formatRs } from '../lib/format';
import { FREE_DELIVERY_FROM } from '../lib/pricing';

const POINTS = [
  { title: 'Pay on delivery', sub: 'Cash or transfer' },
  { title: 'Free delivery', sub: `Over ${formatRs(FREE_DELIVERY_FROM)}` },
  {
    title: '1–3 days',
    sub: 'Isb & Rwp',
    label: 'Delivered in 1 to 3 days in Islamabad and Rawalpindi',
  },
];

/** The three things people ask before ordering, answered in one line. */
export default function Reassurance() {
  return (
    <div className="bg-white border-b border-ink/10">
      <ul className="container mx-auto px-4 grid grid-cols-3">
        {POINTS.map(({ title, sub, label }, i) => (
          <li
            key={title}
            aria-label={label}
            className={`py-4 px-1 text-center ${i ? 'border-l border-ink/10' : ''}`}
          >
            <p className="text-[12px] sm:text-sm font-semibold text-ink leading-tight">{title}</p>
            <p className="text-[11px] sm:text-xs text-ink/70 mt-0.5 tabular">{sub}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
