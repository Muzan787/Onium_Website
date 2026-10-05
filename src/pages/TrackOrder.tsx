import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, MessageCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRs } from '../lib/format';
import { whatsappWith } from '../lib/contact';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';
import Field from '../components/Field';

/** What get_order_by_tracking returns: just enough to show progress. */
interface TrackedOrder {
  id: string;
  status: string;
  created_at: string;
  total_price: number;
}

/** The order statuses the admin panel sets, in the order they happen. */
const STEPS = [
  { status: 'pending', label: 'Order received', detail: "We've got your order and will message you to arrange delivery." },
  { status: 'processing', label: 'Being prepared', detail: "We're packing your order." },
  { status: 'shipped', label: 'On the way', detail: 'A rider has your order.' },
  { status: 'delivered', label: 'Delivered', detail: 'Your order has arrived.' },
];

const cleanCode = (value: string) => value.replace(/^#/, '').trim().toUpperCase();

export default function TrackOrder() {
  // The order confirmation links here as /track-order?order=CODE.
  const [searchParams] = useSearchParams();
  const linkedCode = searchParams.get('order') ?? '';
  const [code, setCode] = useState(linkedCode);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function track(value: string) {
    const cleaned = cleanCode(value);
    setOrder(null);
    if (cleaned.length < 8) {
      setError('Order numbers are 8 characters, like 12AB34CD.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_order_by_tracking', { code: cleaned })
        .maybeSingle<TrackedOrder>();
      if (rpcError) throw rpcError;
      if (!data) setError(`We couldn't find order #${cleaned}. Check the number on your confirmation email.`);
      else setOrder(data);
    } catch (err) {
      console.error(err);
      setError("Couldn't look up that order. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linkedCode) track(linkedCode);
  }, [linkedCode]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    track(code);
  };

  return (
    <div>
      <SEO title="Track your order" description="Check the status of your Onium order." noIndex />
      <PageIntro title="Track your order" lede="Enter the order number from your confirmation." />

      <div className="container mx-auto px-4 py-10 md:py-16 lg:grid lg:grid-cols-12 lg:gap-16">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-5 grid gap-4 self-start">
          <Field
            id="track-code"
            label="Order number"
            hint="For example #12AB34CD."
            error={error && !order ? error : undefined}
          >
            {(props) => (
              <input
                {...props}
                type="text"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${props.className} uppercase tracking-wide`}
              />
            )}
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-70 transition-colors"
          >
            {loading ? 'Looking it up…' : 'Track order'}
          </button>
        </form>

        <div className="lg:col-span-7 mt-10 lg:mt-0" aria-live="polite">
          {order && <OrderProgress order={order} />}
        </div>
      </div>
    </div>
  );
}

function OrderProgress({ order }: { order: TrackedOrder }) {
  const code = order.id.slice(0, 8).toUpperCase();
  const cancelled = order.status === 'cancelled';
  const current = Math.max(0, STEPS.findIndex((step) => step.status === order.status));
  const placed = new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section aria-labelledby="order-heading" className="rounded-[28px] bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="order-heading" className="font-display font-extrabold text-ink text-2xl md:text-3xl tabular tracking-wide">
          Order #{code}
        </h2>
        <p className="text-sm text-ink/70">Placed {placed}</p>
      </div>
      <p className="mt-1 text-[15px] text-ink/70">
        Total <span className="font-semibold text-ink tabular">{formatRs(Number(order.total_price))}</span>, pay on delivery
      </p>

      {cancelled ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-clay-50 p-5">
          <span aria-hidden className="shrink-0 w-8 h-8 rounded-full bg-clay-700 text-white grid place-items-center">
            <X className="w-4 h-4" strokeWidth={3} />
          </span>
          <div>
            <p className="font-semibold text-clay-800">This order was cancelled</p>
            <p className="mt-1 text-[15px] text-ink/75">If that's unexpected, message us and we'll sort it out.</p>
          </div>
        </div>
      ) : (
        <ol className="mt-7">
          {STEPS.map((step, i) => {
            const done = i < current || order.status === 'delivered';
            const isCurrent = i === current && order.status !== 'delivered';
            const last = i === STEPS.length - 1;
            return (
              <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0" aria-current={isCurrent ? 'step' : undefined}>
                {!last && (
                  <span
                    aria-hidden
                    className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${i < current ? 'bg-primary-600' : 'bg-ink/10'}`}
                  />
                )}
                <span
                  aria-hidden
                  className={`relative shrink-0 w-8 h-8 rounded-full grid place-items-center ${
                    done
                      ? 'bg-primary-600 text-white'
                      : isCurrent
                        ? 'bg-white ring-[3px] ring-primary-600'
                        : 'bg-white ring-2 ring-ink/15'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" strokeWidth={3} /> : isCurrent && <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                </span>
                <div className="pt-1">
                  <p className={`font-semibold ${done || isCurrent ? 'text-ink' : 'text-ink/60'}`}>
                    {step.label}
                    <span className="sr-only">{done ? ', done' : isCurrent ? ', current step' : ', not yet'}</span>
                  </p>
                  {isCurrent && <p className="mt-0.5 text-[15px] text-ink/70">{step.detail}</p>}
                  {order.status === 'delivered' && last && <p className="mt-0.5 text-[15px] text-ink/70">{step.detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <a
        href={whatsappWith(`Assalam o Alaikum, I have a question about my order #${code}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-12 px-6 rounded-full border border-ink/15 text-ink font-semibold hover:bg-surface transition-colors"
      >
        <MessageCircle className="w-[18px] h-[18px] text-[#1DA851]" aria-hidden />
        Ask about this order
      </a>
    </section>
  );
}
