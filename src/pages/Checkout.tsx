import { FormEvent, ReactNode, useEffect, useId, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { AlertCircle, ArrowLeft, Check, ChevronDown, Copy, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { formatRs } from '../lib/format';
import { finalPriceOf } from '../lib/productInfo';
import { deliveryFeeFor } from '../lib/pricing';
import { useFooterInView } from '../hooks/useFooterInView';
import { useInViewport } from '../hooks/useInViewport';
import SEO from '../components/SEO';
import { OrderLines, OrderTotals } from '../components/OrderSummary';

// Delivery is limited to these two cities for now.
const SERVICEABLE_CITIES = ['Islamabad', 'Rawalpindi'];
const EASE = [0.16, 1, 0.3, 1] as const;

// The one live code: 10% off a customer's first order, for signed-in customers.
const WELCOME_CODE = 'WELCOME10';
const WELCOME_RATE = 0.1;

type FieldName = 'name' | 'phone' | 'email' | 'address';
type Errors = Partial<Record<FieldName, string>>;

interface PlacedOrder {
  id: string;
  total: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

function validate(form: { name: string; phone: string; email: string; address: string }): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name.';
  const digits = form.phone.replace(/\D/g, '');
  if (!digits) errors.phone = 'Enter your mobile number.';
  else if (digits.length < 10 || digits.length > 13) errors.phone = 'Enter a full mobile number, like 0300 1234567.';
  if (!form.email.trim()) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter an email address like name@example.com.';
  if (!form.address.trim()) errors.address = 'Enter your house number, street and area.';
  return errors;
}

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const reduceMotion = useReducedMotion();
  const footerInView = useFooterInView();
  // On a phone the bar hands over to the button at the end of the form, so
  // "Place order" is never missing just as someone finishes filling it in.
  const [inlinePlaceRef, inlinePlaceInView] = useInViewport<HTMLButtonElement>();

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: 'Islamabad', instructions: '' });
  const [showErrors, setShowErrors] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const subtotal = getTotalPrice();
  const discount = couponApplied ? subtotal * WELCOME_RATE : 0;
  const delivery = deliveryFeeFor(subtotal);
  const total = subtotal - discount + delivery;
  const errors = validate(form);

  // Signed-in customers get their name and email filled in; the email is the
  // one coupons are checked against, so it stays locked.
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data.user) return;
        setUser(data.user);
        setForm((prev) => ({
          ...prev,
          email: data.user.email || prev.email,
          name: prev.name || data.user.user_metadata?.full_name || '',
        }));
      })
      .catch((error) => console.error('Auth check failed', error));
  }, []);

  const set = (field: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code || !user) return;
    setCouponError('');
    if (code !== WELCOME_CODE) {
      setCouponError("That code isn't valid.");
      return;
    }
    setIsCheckingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_email', user.email)
        .ilike('special_instructions', `%${code}%`)
        .limit(1);
      if (error) throw error;
      if (data && data.length > 0) setCouponError("You've already used this code.");
      else setCouponApplied(true);
    } catch (error) {
      console.error('Error checking coupon:', error);
      setCouponError("Couldn't check the code. Try again.");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const firstInvalid = (['name', 'phone', 'email', 'address'] as FieldName[]).find((field) => errors[field]);
    if (firstInvalid) {
      setShowErrors(true);
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }

    setIsPlacing(true);
    try {
      // Generated here rather than read back from the insert, because
      // customers aren't allowed to select from orders.
      const id = crypto.randomUUID();
      const address = `${form.address.trim()}, ${form.city}`;

      const { error: orderError } = await supabase.from('orders').insert({
        id,
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        customer_address: address,
        special_instructions:
          form.instructions.trim() + (couponApplied ? ` [Coupon Applied: ${WELCOME_CODE}]` : ''),
        subtotal_price: subtotal,
        shipping_charge: delivery,
        total_price: total,
        status: 'pending',
        payment_method: 'cod',
      });
      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from('order_items').insert(
        cartItems.map((item) => ({
          order_id: id,
          product_id: item.id,
          product_title: item.title,
          quantity: item.quantity,
          // What the customer actually pays per unit, so the lines add up to
          // the subtotal even when a product is discounted.
          price_at_purchase: finalPriceOf(item),
        })),
      );
      if (itemsError) throw itemsError;

      setPlaced({ id, total, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), address });
      clearCart();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("Couldn't place your order. Check your connection and try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (placed) return <OrderPlaced order={placed} />;
  if (cartItems.length === 0) return <Navigate to="/cart" replace />;

  const fieldError = (field: FieldName) => (showErrors ? errors[field] : undefined);
  const placeLabel = isPlacing ? 'Placing order…' : 'Place order';

  return (
    <div>
      <SEO title="Checkout" noIndex />

      <div className="container mx-auto px-4 pt-4 pb-12 md:pt-8 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
        <div className="lg:col-span-7">
          <Link
            to="/cart"
            className="-ml-2 inline-flex items-center gap-1.5 min-h-11 px-2 rounded-full text-sm font-semibold text-primary-700 hover:underline underline-offset-4"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to cart
          </Link>
          <h1 className="mt-2 text-[40px] md:text-5xl font-extrabold text-ink leading-none">Checkout</h1>

          <MobileSummary items={cartItems} subtotal={subtotal} delivery={delivery} discount={discount} />

          <form id="checkout-form" noValidate onSubmit={handleSubmit} className="mt-10 grid gap-12">
            <FormSection
              step={1}
              title="Your details"
              aside={
                !user && (
                  <Link to="/login" className="inline-flex items-center min-h-11 text-sm font-semibold text-primary-700 hover:underline underline-offset-4">
                    Log in
                  </Link>
                )
              }
            >
              <Field id="checkout-name" label="Full name" error={fieldError('name')}>
                {(props) => (
                  <input {...props} type="text" autoComplete="name" value={form.name} onChange={(e) => set('name')(e.target.value)} />
                )}
              </Field>
              <Field
                id="checkout-phone"
                label="Mobile number"
                hint="We'll message you on WhatsApp here to arrange delivery."
                error={fieldError('phone')}
              >
                {(props) => (
                  <input
                    {...props}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0300 1234567"
                    value={form.phone}
                    onChange={(e) => set('phone')(e.target.value)}
                  />
                )}
              </Field>
              <Field
                id="checkout-email"
                label="Email"
                hint={user ? 'From your account.' : 'For your order confirmation.'}
                error={fieldError('email')}
                locked={!!user}
              >
                {(props) => (
                  <input
                    {...props}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    readOnly={!!user}
                    onChange={(e) => set('email')(e.target.value)}
                  />
                )}
              </Field>
            </FormSection>

            <FormSection step={2} title="Delivery">
              <Field id="checkout-city" label="City" hint="We deliver in Islamabad and Rawalpindi for now.">
                {(props) => (
                  <select {...props} value={form.city} onChange={(e) => set('city')(e.target.value)}>
                    {SERVICEABLE_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field id="checkout-address" label="Address" error={fieldError('address')}>
                {(props) => (
                  <textarea
                    {...props}
                    rows={3}
                    autoComplete="street-address"
                    placeholder="House, street, sector or area"
                    value={form.address}
                    onChange={(e) => set('address')(e.target.value)}
                  />
                )}
              </Field>
              <Field id="checkout-notes" label="Delivery notes" optional>
                {(props) => (
                  <textarea
                    {...props}
                    rows={2}
                    placeholder="A landmark, or a good time to deliver"
                    value={form.instructions}
                    onChange={(e) => set('instructions')(e.target.value)}
                  />
                )}
              </Field>
            </FormSection>

            <FormSection step={3} title="Payment">
              <div className="rounded-3xl border-2 border-primary-600 bg-white p-5 flex gap-4">
                <span aria-hidden className="mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 border-primary-600 grid place-items-center">
                  <span className="w-3 h-3 rounded-full bg-primary-600" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Pay on delivery</p>
                  <p className="mt-1 text-[15px] text-ink/70">
                    Pay when your order arrives. Online transfer is preferred, or cash to the rider.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5">
                {couponApplied ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 font-semibold text-leaf-800">
                      <Check className="w-[18px] h-[18px]" aria-hidden />
                      {WELCOME_CODE} applied, 10% off
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponApplied(false);
                        setCouponCode('');
                      }}
                      className="min-h-11 px-2 text-sm font-semibold text-ink/70 underline underline-offset-2 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCouponOpen((open) => !open)}
                      aria-expanded={couponOpen}
                      aria-controls="coupon-panel"
                      className="w-full flex items-center justify-between min-h-11 font-semibold text-ink"
                    >
                      Have a discount code?
                      <ChevronDown
                        className={`w-5 h-5 text-ink/60 transition-transform ${couponOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    {couponOpen && (
                      <div id="coupon-panel" className="mt-3">
                        {user ? (
                          <>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                aria-label="Discount code"
                                aria-invalid={!!couponError}
                                aria-describedby={couponError ? 'coupon-error' : undefined}
                                autoCapitalize="characters"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value);
                                  setCouponError('');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    applyCoupon();
                                  }
                                }}
                                className={`${INPUT} flex-1 min-w-0 uppercase`}
                              />
                              <button
                                type="button"
                                onClick={applyCoupon}
                                disabled={isCheckingCoupon || !couponCode.trim()}
                                className="shrink-0 min-h-[52px] px-6 rounded-2xl bg-ink text-white font-semibold disabled:opacity-50 transition-opacity"
                              >
                                {isCheckingCoupon ? 'Checking…' : 'Apply'}
                              </button>
                            </div>
                            {couponError && (
                              <p id="coupon-error" className="mt-2 flex items-center gap-1.5 text-sm text-clay-800">
                                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
                                {couponError}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-[15px] text-ink/70">
                            Discount codes work with an account.{' '}
                            <Link to="/login" className="font-semibold text-primary-700 underline underline-offset-2 whitespace-nowrap">
                              Log in
                            </Link>{' '}
                            to use one.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </FormSection>

            <div className="lg:hidden">
              <button
                ref={inlinePlaceRef}
                type="submit"
                disabled={isPlacing}
                className="w-full min-h-[56px] px-6 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-between gap-3 hover:bg-primary-700 disabled:opacity-70 transition-colors"
              >
                <span>{placeLabel}</span>
                <span className="tabular">{formatRs(total)}</span>
              </button>
              <p className="mt-3 text-sm text-ink/70 text-center">You'll pay when it arrives.</p>
            </div>
          </form>
        </div>

        <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 lg:mt-14">
          <div className="rounded-[28px] bg-white p-7">
            <h2 className="font-display font-extrabold text-ink text-2xl">Your order</h2>
            <div className="mt-5">
              <OrderLines items={cartItems} />
            </div>
            <div className="mt-6 pt-6 border-t border-ink/10">
              <OrderTotals subtotal={subtotal} delivery={delivery} discount={discount} discountLabel={WELCOME_CODE} />
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={isPlacing}
              className="mt-6 w-full min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-70 transition-colors"
            >
              {placeLabel}
            </button>
            <p className="mt-3 text-sm text-ink/70 text-center">You'll pay {formatRs(total)} when it arrives.</p>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {!footerInView && !inlinePlaceInView && (
          <motion.div
            key="place-bar"
            className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-ink/10 shadow-[0_-12px_32px_-16px_rgba(10,27,61,0.3)]"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            initial={reduceMotion ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="px-4 pt-3 flex items-center gap-4">
              <div className="min-w-0">
                <p className="text-xs text-ink/70">Pay on delivery</p>
                <p className="font-display font-extrabold text-ink text-2xl leading-tight tabular">{formatRs(total)}</p>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={isPlacing}
                className="flex-1 min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-70 active:scale-[0.98] transition-[background-color,transform,opacity]"
              >
                {placeLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------- PIECES */

const INPUT =
  'w-full min-h-[52px] px-4 rounded-2xl border border-ink/15 bg-white text-base text-ink placeholder:text-ink/45 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 aria-[invalid=true]:border-clay-700 [&[readonly]]:bg-ink/5 [&[readonly]]:text-ink/70';

function FormSection({ step, title, aside, children }: { step: number; title: string; aside?: ReactNode; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="flex items-center gap-3 font-display font-extrabold text-ink text-2xl">
          <span aria-hidden className="shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white font-sans font-bold text-base grid place-items-center tracking-normal">
            {step}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

interface FieldControlProps {
  id: string;
  className: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

function Field({
  id,
  label,
  hint,
  error,
  optional,
  locked,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  locked?: boolean;
  children: (props: FieldControlProps) => ReactNode;
}) {
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
          className: `${INPUT} ${id.includes('address') || id.includes('notes') ? 'py-3 resize-none' : ''}`,
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

function MobileSummary({
  items,
  subtotal,
  delivery,
  discount,
}: {
  items: ReturnType<typeof useCart>['cartItems'];
  subtotal: number;
  delivery: number;
  discount: number;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="lg:hidden mt-6 rounded-[28px] bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-summary"
        className="w-full flex items-center gap-3 p-5 text-left"
      >
        <span aria-hidden className="shrink-0 flex -space-x-2.5">
          {items.slice(0, 2).map((item) => (
            <img
              key={item.id}
              src={item.image_url}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
            />
          ))}
        </span>
        <span className="flex-1 min-w-0 whitespace-nowrap">
          <span className="block font-semibold text-ink">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
          <span className="flex items-center gap-1 text-sm text-primary-700 font-medium">
            {open ? 'Hide order' : 'Show order'}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
          </span>
        </span>
        <span className="shrink-0 font-display font-extrabold text-ink text-xl tabular whitespace-nowrap">
          {formatRs(subtotal - discount + delivery)}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-summary"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="pt-5 border-t border-ink/10">
                <OrderLines items={items} />
              </div>
              <div className="mt-5 pt-5 border-t border-ink/10">
                <OrderTotals subtotal={subtotal} delivery={delivery} discount={discount} discountLabel={WELCOME_CODE} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderPlaced({ order }: { order: PlacedOrder }) {
  const reduceMotion = useReducedMotion();
  const code = order.id.slice(0, 8).toUpperCase();
  const firstName = order.name.split(/\s+/)[0];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Order number copied');
    } catch {
      toast.error("Couldn't copy the order number");
    }
  };

  return (
    <div>
      <SEO title="Order placed" noIndex />
      <section className="container mx-auto px-4 pt-12 pb-16 md:pt-20 max-w-xl text-center">
        <motion.span
          aria-hidden
          className="mx-auto w-20 h-20 rounded-full bg-leaf-600 text-white grid place-items-center"
          initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Check className="w-10 h-10" strokeWidth={3} />
        </motion.span>
        <h1 className="mt-6 text-[40px] md:text-5xl font-extrabold text-ink leading-none">Order placed</h1>
        <p className="mt-4 text-[17px] text-ink/75">
          Thanks, {firstName}. We'll message you on WhatsApp at <span className="tabular whitespace-nowrap">{order.phone}</span> to
          arrange a delivery time.
        </p>

        <div className="mt-8 rounded-[28px] bg-white p-6 text-left">
          <dl className="grid gap-4 text-[15px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink/70">Order number</dt>
              <dd className="flex items-center gap-1">
                <span className="font-display font-bold text-ink text-lg tabular tracking-wide">#{code}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label="Copy order number"
                  className="-mr-2 w-11 h-11 grid place-items-center rounded-full text-ink/60 hover:text-ink hover:bg-surface transition-colors"
                >
                  <Copy className="w-4 h-4" aria-hidden />
                </button>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/70">To pay on delivery</dt>
              <dd className="font-semibold text-ink tabular">{formatRs(order.total)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink/70">Delivering to</dt>
              <dd className="text-ink text-right">{order.address}</dd>
            </div>
          </dl>
          <p className="mt-5 pt-5 border-t border-ink/10 text-sm text-ink/70">
            A confirmation email is on its way to {order.email}.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/track-order?order=${code}`}
            className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
          >
            Track your order
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full border border-ink/15 text-ink font-semibold hover:bg-white transition-colors"
          >
            Keep shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
