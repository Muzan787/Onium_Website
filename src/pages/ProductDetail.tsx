import { ChangeEvent, FormEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, Check, ImagePlus, Maximize2, MessageCircle, Share2, Star, X } from 'lucide-react';
import { supabase, Product, Review } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { accentFor } from '../lib/productAccents';
import { categoryLabel, formatRs } from '../lib/format';
import { cleanDescription, describeTitle, finalPriceOf, plainDescription, readSpecs } from '../lib/productInfo';
import { markArrived } from '../lib/morph';
import SEO from '../components/SEO';
import Reassurance from '../components/Reassurance';
import ProductTile from '../components/ProductTile';
import QuantityStepper from '../components/QuantityStepper';
import { useFooterInView } from '../hooks/useFooterInView';

const WHATSAPP = 'https://wa.me/923231550147';
const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_QUANTITY = 99;
const ALL_PRODUCTS = { pathname: '/', hash: '#products' };

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const whatsappAbout = (title: string) =>
  `${WHATSAPP}?text=${encodeURIComponent(`Hi Onium, I have a question about ${title}.`)}`;

/** Remount per product, so nothing (quantity, reviews, an open form) carries
 *  over when you move from one product straight to another. */
export default function ProductDetailRoute() {
  const { slug = '' } = useParams();
  return <ProductDetail key={slug} slug={slug} />;
}

function ProductDetail({ slug }: { slug: string }) {
  const location = useLocation();
  const handedOver = (location.state as { product?: Product } | null)?.product;
  // A product link passes the product along, so the page can draw at once
  // and the tapped photo has somewhere to land.
  const [initial] = useState(() => (handedOver?.slug === slug ? handedOver : null));

  const { addToCart } = useCart();
  const reduceMotion = useReducedMotion();

  const [product, setProduct] = useState<Product | null>(initial);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'failed'>(initial ? 'ready' : 'loading');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [others, setOthers] = useState<Product[]>([]);
  const [attempt, setAttempt] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const addedTimer = useRef<number>();

  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const photoRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Runs before paint: the incoming photo needs the page at the top now, not
  // after ScrollToTop's effect, and the morph waits for the photo to decode.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!initial) {
      markArrived();
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const img = imgRef.current;
    (img ? img.decode().catch(() => undefined) : Promise.resolve()).then(markArrived);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('Error fetching product:', error);
        // Keep showing the handed-over copy rather than an error.
        if (!initial) setStatus('failed');
        return;
      }
      if (!data) {
        setProduct(null);
        setStatus('missing');
        return;
      }
      setProduct(data);
      setStatus('ready');

      const [reviewResult, rangeResult] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('product_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false }),
        supabase.from('products').select('*').neq('id', data.id).order('created_at'),
      ]);
      if (cancelled) return;
      setReviews(reviewResult.data ?? []);
      // Same kind of cleaner first, then the rest of the range.
      const range = rangeResult.data ?? [];
      setOthers([
        ...range.filter((p) => p.category === data.category),
        ...range.filter((p) => p.category !== data.category),
      ]);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, initial, attempt]);

  // The buy bar steps aside for the footer, so the page can actually end.
  const footerInView = useFooterInView();

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  if (status === 'loading') return <ProductSkeleton />;

  if (!product || status !== 'ready') {
    const failed = status === 'failed';
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <h1 className="text-3xl font-extrabold text-ink">
          {failed ? "We couldn't load this product" : "We couldn't find that product"}
        </h1>
        <p className="mt-3 text-ink/70">
          {failed
            ? 'Check your connection and try again.'
            : 'It may have been renamed or taken off the shelf.'}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {failed && (
            <button
              type="button"
              onClick={() => {
                setStatus('loading');
                setAttempt((n) => n + 1);
              }}
              className="min-h-12 px-7 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            to={ALL_PRODUCTS}
            className={`inline-flex items-center justify-center min-h-12 px-7 rounded-full font-semibold transition-colors ${
              failed ? 'border border-ink/15 text-ink hover:bg-white' : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            See all cleaners
          </Link>
        </div>
      </div>
    );
  }

  const accent = accentFor(product);
  const { name, strapline, size } = describeTitle(product);
  const { features, rows } = readSpecs(product.specifications);
  const description = cleanDescription(product.description);
  const images = [product.image_url, ...(product.additional_images ?? [])].filter(Boolean);
  const price = finalPriceOf(product);
  const hasDiscount = (product.discount ?? 0) > 0;
  const soldOut = product.stock === 0;
  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY, product.stock || MAX_QUANTITY));
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const handleAdd = () => {
    if (soldOut) return;
    addToCart(product, quantity);
    setAdded(true);
    setAnnouncement(quantity === 1 ? `Added ${name} to your cart.` : `Added ${name} to your cart, quantity ${quantity}.`);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1800);
  };

  const handleShare = async () => {
    const url = `https://onium.store/product/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch {
        // Closing the share sheet is not an error worth reporting.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const buyControls = soldOut ? (
    <div className="flex-1 flex items-center gap-3">
      <span className="flex-1 min-h-[52px] grid place-items-center rounded-full bg-ink/5 text-ink/70 font-semibold">
        Sold out
      </span>
      <a
        href={whatsappAbout(product.title)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-h-[52px] inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-ink font-semibold hover:brightness-95 transition-[filter]"
      >
        <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
        Ask when it's back
      </a>
    </div>
  ) : (
    <>
      <QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} label={`Quantity of ${name}`} />
      <AddButton added={added} total={price * quantity} onAdd={handleAdd} />
    </>
  );

  return (
    <div>
      <SEO
        title={product.title}
        description={plainDescription(product.description).slice(0, 155)}
        image={product.image_url}
        url={`https://onium.store/product/${product.slug}`}
      />

      {/* ------------------------------------------------------ THE PRODUCT */}
      <section aria-labelledby="product-name" style={{ backgroundColor: accent.tint }}>
        <div className="container mx-auto px-4 pt-2 pb-9 md:pt-6 md:pb-16">
          <div className="flex items-center justify-between">
            <Link
              to={ALL_PRODUCTS}
              className="-ml-2 inline-flex items-center gap-1.5 min-h-11 px-2 rounded-full text-sm font-semibold hover:underline underline-offset-4"
              style={{ color: accent.deep }}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              All cleaners
            </Link>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this product"
              className="-mr-1 w-11 h-11 grid place-items-center rounded-full bg-white/70 text-ink hover:bg-white transition-colors"
            >
              <Share2 className="w-[18px] h-[18px]" aria-hidden />
            </button>
          </div>

          <div className="mt-2 md:mt-6 md:grid md:grid-cols-2 md:gap-12 lg:gap-20 md:items-start">
            <div className="md:sticky md:top-24">
              {/* The landing spot for the photo tapped on the previous page
                  (see lib/morph.ts); `product-photo` carries the transition name. */}
              <button
                ref={photoRef}
                type="button"
                onClick={() => setZoomOpen(true)}
                aria-label={`View a larger photo of ${name}`}
                className="product-photo relative block w-full aspect-square rounded-[28px] overflow-hidden bg-white cursor-zoom-in shadow-[0_28px_56px_-28px_rgba(10,27,61,0.55)]"
              >
                <img
                  ref={imgRef}
                  src={images[activeImage]}
                  alt={product.title}
                  width={900}
                  height={900}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-clay-700 text-white text-sm font-bold px-3 py-1 rounded-full tabular">
                    {product.discount}% off
                  </span>
                )}
                <span
                  aria-hidden
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 text-ink grid place-items-center shadow-sm"
                >
                  <Maximize2 className="w-4 h-4" />
                </span>
              </button>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`Photo ${i + 1} of ${images.length}`}
                      aria-pressed={i === activeImage}
                      className={`relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-offset-2 transition-shadow ${
                        i === activeImage ? 'ring-primary-600' : 'ring-transparent'
                      }`}
                    >
                      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div
              className="mt-7 md:mt-2"
              initial={reduceMotion ? false : 'hidden'}
              animate="shown"
              variants={{ shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
            >
              <motion.p variants={rise} className="text-sm font-semibold" style={{ color: accent.deep }}>
                {categoryLabel(product.category)}
              </motion.p>

              <motion.h1
                variants={rise}
                id="product-name"
                ref={headingRef}
                tabIndex={-1}
                className="mt-2 text-ink font-extrabold text-[40px] md:text-[56px] leading-[0.95] outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                {name}
                {strapline && (
                  <span className="block mt-3 font-sans font-medium text-lg md:text-xl tracking-normal leading-snug text-ink/70">
                    {strapline}
                  </span>
                )}
              </motion.h1>

              <motion.div variants={rise} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-display font-extrabold text-ink text-[34px] md:text-[40px] leading-none tabular">
                  {formatRs(price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-ink/65 line-through tabular">
                    <span className="sr-only">Was </span>
                    {formatRs(product.price)}
                  </span>
                )}
                {size && (
                  <span className="px-3 py-1 rounded-full bg-white text-sm font-semibold text-ink/80">{size}</span>
                )}
              </motion.div>

              {reviews.length > 0 && (
                <motion.a
                  variants={rise}
                  href="#reviews"
                  className="mt-3 inline-flex items-center gap-2 min-h-11 text-sm font-medium text-ink"
                >
                  <Stars rating={averageRating} />
                  <span className="tabular">{averageRating.toFixed(1)}</span>
                  <span className="text-ink/70 underline underline-offset-2">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                </motion.a>
              )}

              {/* On a phone these controls live in the bar along the bottom. */}
              <motion.div variants={rise} className="hidden md:flex mt-8 items-center gap-3 max-w-md">
                {buyControls}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Reassurance />

      {/* ------------------------------------------------- WHAT IT DOES */}
      <section className="container mx-auto px-4 py-12 md:py-20 md:grid md:grid-cols-12 md:gap-12 lg:gap-20">
        <div className="md:col-span-7">
          <h2 className="font-display font-extrabold text-ink text-[28px] md:text-4xl">What it does</h2>
          {description && (
            <div
              className="mt-4 max-w-prose text-[17px] leading-relaxed text-ink/80 [&_p+p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-ink [&_a]:text-primary-700 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
          {features.length > 0 && (
            <ul className="mt-7 grid gap-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[16px] font-medium text-ink">
                  <span
                    aria-hidden
                    className="shrink-0 w-7 h-7 rounded-full grid place-items-center"
                    style={{ backgroundColor: accent.tint, color: accent.deep }}
                  >
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-5 mt-12 md:mt-0">
          {rows.length > 0 && (
            <>
              <h2 className="font-display font-extrabold text-ink text-[28px] md:text-4xl">Details</h2>
              <dl className="mt-4 border-t border-ink/10">
                {rows.map(({ label, value }) => (
                  <div key={label} className="flex items-baseline justify-between gap-6 py-3.5 border-b border-ink/10">
                    <dt className="text-[15px] text-ink/70">{label}</dt>
                    <dd className="text-[15px] font-semibold text-ink text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          <div className={`${rows.length ? 'mt-8' : ''} rounded-3xl bg-white p-6`}>
            <p className="font-display font-bold text-ink text-xl">Not sure it's the right one?</p>
            <p className="mt-1.5 text-[15px] text-ink/70">Ask us on WhatsApp before you order.</p>
            <a
              href={whatsappAbout(product.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 min-h-12 px-6 rounded-full border border-ink/15 text-ink font-semibold hover:bg-surface transition-colors"
            >
              <MessageCircle className="w-[18px] h-[18px] text-[#1DA851]" aria-hidden />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <ReviewsSection productId={product.id} reviews={reviews} averageRating={averageRating} />

      {/* ------------------------------------------- MORE FROM THE RANGE */}
      {others.length > 0 && (
        <section aria-labelledby="more-heading" className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-4">
              <h2 id="more-heading" className="font-display font-extrabold text-ink text-[28px] md:text-4xl">
                More from the range
              </h2>
              <Link
                to={ALL_PRODUCTS}
                className="shrink-0 inline-flex items-center min-h-11 text-sm font-semibold text-primary-700 hover:underline underline-offset-4"
              >
                See all
              </Link>
            </div>
            <ul className="mt-5 -mx-4 px-4 scroll-px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible">
              {others.map((other) => (
                <li key={other.id} className="w-[164px] shrink-0 snap-start md:w-auto md:[&:nth-child(n+5)]:hidden">
                  <ProductTile product={other} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* --------------------------------------------- PHONE BUY BAR */}
      <AnimatePresence>
        {!footerInView && (
          <motion.div
            key="buy-bar"
            className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-ink/10 shadow-[0_-12px_32px_-16px_rgba(10,27,61,0.3)]"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            initial={reduceMotion ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="px-4 pt-3 flex items-center gap-2.5">{buyControls}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <Lightbox
        open={zoomOpen}
        src={images[activeImage]}
        alt={product.title}
        onClose={() => {
          setZoomOpen(false);
          photoRef.current?.focus();
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------- PIECES */

function AddButton({ added, total, onAdd }: { added: boolean; total: number; onAdd: () => void }) {
  const reduceMotion = useReducedMotion();
  const swap = reduceMotion
    ? {}
    : { initial: { y: 14, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -14, opacity: 0 } };

  return (
    <button
      type="button"
      onClick={onAdd}
      // Leaf 700 rather than 600: white text on it needs the extra depth.
      className={`relative flex-1 min-w-0 min-h-[52px] px-4 sm:px-6 rounded-full overflow-hidden text-white font-semibold transition-colors duration-300 active:scale-[0.98] ${
        added ? 'bg-leaf-700' : 'bg-primary-600 hover:bg-primary-700'
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {added ? (
          <motion.span key="added" className="flex items-center justify-center gap-2 whitespace-nowrap" transition={{ duration: 0.25 }} {...swap}>
            <Check className="w-5 h-5" aria-hidden />
            Added to cart
          </motion.span>
        ) : (
          <motion.span key="add" className="flex items-center justify-between gap-2 whitespace-nowrap" transition={{ duration: 0.25 }} {...swap}>
            <span>Add to cart</span>
            {/* Below 360px there is no room for both; the label matters more. */}
            <span className="tabular max-[359px]:hidden">{formatRs(total)}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function Stars({ rating, className = 'w-4 h-4' }: { rating: number; className?: string }) {
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

function ReviewsSection({
  productId,
  reviews,
  averageRating,
}: {
  productId: string;
  reviews: Review[];
  averageRating: number;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [submittedAs, setSubmittedAs] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const formId = useId();

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-white border-y border-ink/10">
      <div className="container mx-auto px-4 py-12 md:py-20 md:grid md:grid-cols-12 md:gap-12 lg:gap-20">
        <div className="md:col-span-5">
          <h2 id="reviews-heading" className="font-display font-extrabold text-ink text-[28px] md:text-4xl">
            Reviews
          </h2>

          {reviews.length > 0 ? (
            <div className="mt-4 flex items-center gap-4">
              <span className="font-display font-extrabold text-ink text-5xl leading-none tabular">
                {averageRating.toFixed(1)}
              </span>
              <div>
                <Stars rating={averageRating} className="w-5 h-5" />
                <p className="mt-1 text-sm text-ink/70">
                  <span className="sr-only">Rated {averageRating.toFixed(1)} out of 5, </span>
                  from {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[16px] text-ink/70">
              No reviews yet. Used it? Tell other customers how it went.
            </p>
          )}

          {submittedAs ? (
            <p role="status" className="mt-6 rounded-2xl bg-leaf-50 text-leaf-800 px-5 py-4 text-[15px] font-medium">
              Thanks, {submittedAs}. Your review will show here once we've checked it.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setFormOpen((open) => !open)}
              aria-expanded={formOpen}
              aria-controls={formId}
              className="mt-6 inline-flex items-center min-h-12 px-6 rounded-full border border-ink/15 text-ink font-semibold hover:bg-surface transition-colors"
            >
              {formOpen ? 'Cancel' : 'Write a review'}
            </button>
          )}
        </div>

        <div className="md:col-span-7">
          <AnimatePresence initial={false}>
            {formOpen && !submittedAs && (
              <motion.div
                id={formId}
                key="form"
                initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <ReviewForm
                  productId={productId}
                  onSubmitted={(name) => {
                    setSubmittedAs(name);
                    setFormOpen(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {reviews.length > 0 && (
            <ul className="mt-8 md:mt-0 grid gap-4">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-3xl bg-surface p-5 md:p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold text-ink">{review.customer_name}</p>
                    <time dateTime={review.created_at} className="shrink-0 text-sm text-ink/70">
                      {new Date(review.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="sr-only">Rated {review.rating} out of 5</span>
                  </div>
                  {review.comment && <p className="mt-3 text-[16px] leading-relaxed text-ink/80">{review.comment}</p>}
                  {review.image_url && (
                    <img
                      src={review.image_url}
                      alt={`Photo from ${review.customer_name}`}
                      loading="lazy"
                      className="mt-4 w-28 h-28 rounded-2xl object-cover"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: (name: string) => void }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldId = useId();

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    let imageUrl: string | null = null;
    if (photo) {
      const body = new FormData();
      body.append('file', photo);
      body.append('upload_preset', 'OniumReviews');
      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dztldh7o2/image/upload', { method: 'POST', body });
        imageUrl = (await response.json()).secure_url ?? null;
      } catch (error) {
        // The review is still worth posting without its photo.
        console.error('Review photo upload failed:', error);
      }
    }

    const { error } = await supabase.from('reviews').insert([
      { customer_name: name.trim(), rating, comment: comment.trim(), image_url: imageUrl, product_id: productId },
    ]);
    setIsSubmitting(false);

    if (error) {
      toast.error("Couldn't post your review. Check your connection and try again.");
      return;
    }
    onSubmitted(name.trim().split(/\s+/)[0]);
  };

  const inputClass =
    'mt-2 w-full min-h-12 px-4 rounded-2xl border border-ink/15 bg-white text-ink text-base placeholder:text-ink/50 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20';

  return (
    <form onSubmit={handleSubmit} className="pt-8 md:pt-0 pb-2 grid gap-5">
      <div>
        <label htmlFor={`${fieldId}-name`} className="text-sm font-semibold text-ink">
          Your name
        </label>
        <input
          id={`${fieldId}-name`}
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Your rating</legend>
        <div className="mt-1 flex items-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="relative w-11 h-11 grid place-items-center cursor-pointer">
              <input
                type="radio"
                name={`${fieldId}-rating`}
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {n} {n === 1 ? 'star' : 'stars'}
              </span>
              <Star
                aria-hidden
                className={`w-7 h-7 rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary-600 ${
                  n <= rating ? 'text-accent-500' : 'text-ink/15'
                }`}
                fill="currentColor"
                strokeWidth={0}
              />
            </label>
          ))}
          <span className="ml-2 text-sm text-ink/70 tabular">{rating} out of 5</span>
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${fieldId}-comment`} className="text-sm font-semibold text-ink">
          Your review
        </label>
        <textarea
          id={`${fieldId}-comment`}
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did it work for you?"
          className={`${inputClass} py-3 resize-none`}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-dashed border-ink/25 text-sm font-semibold text-ink cursor-pointer hover:bg-surface transition-colors focus-within:ring-2 focus-within:ring-primary-600">
          <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
          <ImagePlus className="w-[18px] h-[18px]" aria-hidden />
          {photo ? 'Change photo' : 'Add a photo'}
          <span className="font-normal text-ink/70">(optional)</span>
        </label>
        {preview && (
          <div className="relative">
            <img src={preview} alt="Your photo" className="w-14 h-14 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                setPreview(null);
              }}
              aria-label="Remove photo"
              className="absolute -top-3 -right-3 w-11 h-11 grid place-items-center"
            >
              <span className="w-6 h-6 rounded-full bg-ink text-white grid place-items-center">
                <X className="w-3.5 h-3.5" aria-hidden />
              </span>
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="justify-self-start min-h-12 px-8 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
}

function Lightbox({ open, src, alt, onClose }: { open: boolean; src: string; alt: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  // Held in a ref so a parent re-render doesn't re-run the effect below and
  // pull focus back to the close button.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onCloseRef.current();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[60] bg-ink/95 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="absolute right-3 w-11 h-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
          >
            <X className="w-6 h-6" aria-hidden />
          </button>
          <motion.img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-2xl"
            initial={reduceMotion ? false : { scale: 0.94 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(event) => event.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="bg-ink/[0.03]">
      <div className="container mx-auto px-4 pt-14 pb-10 md:pt-20 md:grid md:grid-cols-2 md:gap-12 lg:gap-20 animate-pulse">
        <div className="aspect-square rounded-[28px] bg-ink/10" />
        <div className="mt-7 md:mt-2">
          <div className="h-4 w-28 rounded-full bg-ink/10" />
          <div className="mt-4 h-10 w-4/5 rounded-2xl bg-ink/10" />
          <div className="mt-3 h-5 w-1/2 rounded-full bg-ink/10" />
          <div className="mt-7 h-9 w-32 rounded-full bg-ink/10" />
        </div>
      </div>
    </div>
  );
}
