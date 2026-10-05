import { Product } from '../lib/supabase';
import { accentFor } from '../lib/productAccents';
import { formatRs } from '../lib/format';
import { describeTitle, finalPriceOf } from '../lib/productInfo';

type Line = Product & { quantity: number };

/** The items in an order, compactly: for checkout's summary. */
export function OrderLines({ items }: { items: Line[] }) {
  return (
    <ul className="grid gap-4">
      {items.map((item) => {
        const { name, size } = describeTitle(item);
        return (
          <li key={item.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={item.image_url}
                alt=""
                width={56}
                height={56}
                className="w-14 h-14 rounded-2xl object-cover"
                style={{ backgroundColor: accentFor(item).tint }}
              />
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-ink text-white text-xs font-bold grid place-items-center tabular">
                <span className="sr-only">Quantity </span>
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink leading-tight truncate">{name}</p>
              {size && <p className="text-sm text-ink/70">{size}</p>}
            </div>
            <p className="shrink-0 font-semibold text-ink tabular">{formatRs(finalPriceOf(item) * item.quantity)}</p>
          </li>
        );
      })}
    </ul>
  );
}

interface OrderTotalsProps {
  subtotal: number;
  delivery: number;
  discount?: number;
  discountLabel?: string;
}

export function OrderTotals({ subtotal, delivery, discount = 0, discountLabel = 'Discount' }: OrderTotalsProps) {
  return (
    <dl className="grid gap-2.5 text-[15px]">
      <div className="flex justify-between gap-4">
        <dt className="text-ink/70">Subtotal</dt>
        <dd className="text-ink tabular">{formatRs(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="text-leaf-800">{discountLabel}</dt>
          <dd className="text-leaf-800 font-semibold tabular">−{formatRs(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-ink/70">Delivery</dt>
        <dd className={delivery ? 'text-ink tabular' : 'text-leaf-800 font-semibold'}>
          {delivery ? formatRs(delivery) : 'Free'}
        </dd>
      </div>
      <div className="flex justify-between items-baseline gap-4 pt-3 mt-1 border-t border-ink/10">
        <dt className="font-display font-bold text-ink text-lg">Total</dt>
        <dd className="font-display font-extrabold text-ink text-2xl tabular">
          {formatRs(subtotal - discount + delivery)}
        </dd>
      </div>
    </dl>
  );
}
