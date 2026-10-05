import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, MessageCircle, Trash2 } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { accentFor } from '../lib/productAccents';
import { formatRs } from '../lib/format';
import { describeTitle, finalPriceOf } from '../lib/productInfo';
import { FREE_DELIVERY_FROM, deliveryFeeFor } from '../lib/pricing';
import { useFooterInView } from '../hooks/useFooterInView';
import { useInViewport } from '../hooks/useInViewport';
import SEO from '../components/SEO';
import ProductLink from '../components/ProductLink';
import ProductTile from '../components/ProductTile';
import QuantityStepper from '../components/QuantityStepper';
import { OrderTotals } from '../components/OrderSummary';

const WHATSAPP = 'https://wa.me/923231550147';
const EASE = [0.16, 1, 0.3, 1] as const;
const ALL_PRODUCTS = { pathname: '/', hash: '#products' };

type CartLine = ReturnType<typeof useCart>['cartItems'][number];

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, addToCart, clearCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const footerInView = useFooterInView();
  // The bar hands over to the button at the end of the totals once that's on screen.
  const [inlineCheckoutRef, inlineCheckoutInView] = useInViewport<HTMLButtonElement>();
  const [range, setRange] = useState<Product[]>([]);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at')
      .then(({ data }) => setRange(data ?? []));
  }, []);

  const subtotal = getTotalPrice();
  const delivery = deliveryFeeFor(subtotal);
  const itemCount = getTotalItems();

  // Whatever isn't in the cart yet, cheapest first: the easiest way over the
  // free delivery line.
  const suggestions = useMemo(() => {
    const inCart = new Set(cartItems.map((item) => item.id));
    return range.filter((p) => !inCart.has(p.id) && p.stock !== 0).sort((a, b) => finalPriceOf(a) - finalPriceOf(b));
  }, [range, cartItems]);

  const whatsappOrder = `${WHATSAPP}?text=${encodeURIComponent(
    `Hi Onium, I'd like to order:\n${cartItems
      .map((item) => `• ${item.title} × ${item.quantity}`)
      .join('\n')}\n\nTotal: ${formatRs(subtotal + delivery)}`,
  )}`;

  const handleRemove = (item: CartLine) => {
    const { name } = describeTitle(item);
    removeFromCart(item.id);
    toast(
      (t) => (
        <span className="flex items-center gap-4">
          <span>Removed {name}</span>
          <button
            type="button"
            onClick={() => {
              addToCart(item, item.quantity);
              toast.dismiss(t.id);
            }}
            className="font-semibold underline underline-offset-2"
          >
            Undo
          </button>
        </span>
      ),
      { id: `removed-${item.id}`, duration: 5000 },
    );
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <SEO title="Your cart" noIndex />
        <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 text-center max-w-md">
          <h1 className="text-[40px] md:text-5xl font-extrabold text-ink leading-none">Your cart is empty</h1>
          <p className="mt-4 text-[17px] text-ink/70">Pick a cleaner for the job and it'll wait for you here.</p>
          <Link
            to={ALL_PRODUCTS}
            className="mt-8 inline-flex items-center justify-center min-h-[52px] px-8 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
          >
            Shop the range
          </Link>
        </section>
        <SuggestionStrip title="The range" products={range} />
      </div>
    );
  }

  return (
    <div>
      <SEO title="Your cart" noIndex />

      <div className="container mx-auto px-4 pt-4 pb-12 md:pt-8 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
        <div className="lg:col-span-7">
          <Link
            to={ALL_PRODUCTS}
            className="-ml-2 inline-flex items-center gap-1.5 min-h-11 px-2 rounded-full text-sm font-semibold text-primary-700 hover:underline underline-offset-4"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Keep shopping
          </Link>

          <div className="mt-2 flex items-baseline justify-between gap-4">
            <h1 className="text-[40px] md:text-5xl font-extrabold text-ink leading-none">Your cart</h1>
            <p className="text-ink/70 tabular">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <DeliveryProgress subtotal={subtotal} />

          <ul className="mt-6 border-t border-ink/10">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.li
                  key={item.id}
                  layout={!reduceMotion}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="border-b border-ink/10 overflow-hidden"
                >
                  <CartRow
                    item={item}
                    onQuantity={(quantity) => updateQuantity(item.id, quantity)}
                    onRemove={() => handleRemove(item)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-3 flex justify-end">
            {confirmingClear ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink/70">Remove everything?</span>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setConfirmingClear(false);
                  }}
                  className="min-h-11 px-4 rounded-full bg-clay-700 text-white font-semibold hover:bg-clay-800 transition-colors"
                >
                  Empty cart
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="min-h-11 px-4 rounded-full border border-ink/15 text-ink font-semibold hover:bg-white transition-colors"
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="min-h-11 px-2 text-sm font-semibold text-ink/70 hover:text-clay-700 transition-colors"
              >
                Empty cart
              </button>
            )}
          </div>

          {/* On a phone the totals sit under the list; the bar below carries the button. */}
          <div className="lg:hidden mt-6 rounded-[28px] bg-white p-6">
            <OrderTotals subtotal={subtotal} delivery={delivery} />
            <button
              ref={inlineCheckoutRef}
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Checkout
            </button>
            <p className="mt-4 text-sm text-ink/70 text-center">Pay on delivery, by bank transfer or cash.</p>
            <WhatsAppOrder href={whatsappOrder} />
          </div>
        </div>

        <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 mt-12 lg:mt-14">
          <div className="rounded-[28px] bg-white p-7">
            <h2 className="font-display font-extrabold text-ink text-2xl">Summary</h2>
            <div className="mt-5">
              <OrderTotals subtotal={subtotal} delivery={delivery} />
            </div>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Checkout
            </button>
            <p className="mt-4 text-sm text-ink/70 text-center">Pay on delivery, by bank transfer or cash.</p>
            <WhatsAppOrder href={whatsappOrder} />
          </div>
        </aside>
      </div>

      <SuggestionStrip title="Add to your order" products={suggestions} />

      <AnimatePresence>
        {!footerInView && !inlineCheckoutInView && (
          <motion.div
            key="checkout-bar"
            className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-ink/10 shadow-[0_-12px_32px_-16px_rgba(10,27,61,0.3)]"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            initial={reduceMotion ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="px-4 pt-3 flex items-center gap-4">
              <div className="min-w-0">
                <p className="text-xs text-ink/70">{delivery ? `Incl. ${formatRs(delivery)} delivery` : 'Free delivery'}</p>
                <p className="font-display font-extrabold text-ink text-2xl leading-tight tabular">
                  {formatRs(subtotal + delivery)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="flex-1 min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 active:scale-[0.98] transition-[background-color,transform]"
              >
                Checkout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CartRow({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartLine;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const photoRef = useRef<HTMLAnchorElement>(null);
  const { name, size } = describeTitle(item);
  const unitPrice = finalPriceOf(item);

  return (
    <div className="py-5 flex gap-4">
      <ProductLink
        ref={photoRef}
        product={item}
        photo={photoRef}
        tabIndex={-1}
        aria-hidden
        className="relative shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden"
        style={{ backgroundColor: accentFor(item).tint }}
      >
        <img src={item.image_url} alt="" width={224} height={224} className="absolute inset-0 w-full h-full object-cover" />
      </ProductLink>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-ink text-lg leading-tight">
              <ProductLink
                product={item}
                photo={photoRef}
                title={item.title}
                className="hover:text-primary-700 transition-colors focus-visible:underline"
              >
                {name}
              </ProductLink>
            </h2>
            {size && <p className="mt-0.5 text-sm text-ink/70">{size}</p>}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name} from cart`}
            className="-mt-2.5 -mr-2.5 shrink-0 w-11 h-11 grid place-items-center rounded-full text-ink/60 hover:text-clay-700 hover:bg-clay-50 transition-colors"
          >
            <Trash2 className="w-[18px] h-[18px]" aria-hidden />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <QuantityStepper
            size="md"
            value={item.quantity}
            onChange={onQuantity}
            max={Math.max(1, Math.min(99, item.stock || 99))}
            label={`Quantity of ${name}`}
          />
          <div className="text-right">
            <p className="font-display font-bold text-ink text-lg tabular">{formatRs(unitPrice * item.quantity)}</p>
            {item.quantity > 1 && <p className="text-xs text-ink/70 tabular">{formatRs(unitPrice)} each</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_DELIVERY_FROM - subtotal);
  const progress = Math.min(1, subtotal / FREE_DELIVERY_FROM);

  return (
    <div className="mt-6 rounded-3xl bg-white p-5">
      {remaining > 0 ? (
        <p className="text-[15px] text-ink">
          Add <span className="font-semibold tabular">{formatRs(remaining)}</span> more for free delivery.
        </p>
      ) : (
        <p className="flex items-center gap-2 text-[15px] font-semibold text-leaf-800">
          <Check className="w-[18px] h-[18px]" aria-hidden />
          Free delivery on this order
        </p>
      )}
      <div
        role="progressbar"
        aria-label="Progress towards free delivery"
        aria-valuemin={0}
        aria-valuemax={FREE_DELIVERY_FROM}
        aria-valuenow={Math.min(subtotal, FREE_DELIVERY_FROM)}
        className="mt-3 h-2 rounded-full bg-ink/10 overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-500 ${
            remaining > 0 ? 'bg-primary-600' : 'bg-leaf-600'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function WhatsAppOrder({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 w-full inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full border border-ink/15 text-ink font-semibold hover:bg-surface transition-colors"
    >
      <MessageCircle className="w-[18px] h-[18px] text-[#1DA851]" aria-hidden />
      Order on WhatsApp instead
    </a>
  );
}

function SuggestionStrip({ title, products }: { title: string; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="suggestions-heading" className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <h2 id="suggestions-heading" className="font-display font-extrabold text-ink text-[28px] md:text-4xl">
          {title}
        </h2>
        <ul className="mt-5 -mx-4 px-4 scroll-px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible">
          {products.map((product) => (
            <li key={product.id} className="w-[164px] shrink-0 snap-start md:w-auto md:[&:nth-child(n+5)]:hidden">
              <ProductTile product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
