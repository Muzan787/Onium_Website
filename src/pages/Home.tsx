import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Baby, Zap, X, Pause, Play, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { supabase, Product } from '../lib/supabase';
import { ACCENTS } from '../lib/productAccents';
import { categoryLabel, formatRs } from '../lib/format';
import { FREE_DELIVERY_FROM } from '../lib/pricing';
import ProductRow from '../components/ProductRow';
import Reassurance from '../components/Reassurance';
import SEO from '../components/SEO';

const WHATSAPP = 'https://wa.me/923231550147';
const ORDER_TEXT = encodeURIComponent('Asalamo Alikum, I want to order…');
const BULK_TEXT = encodeURIComponent("I'm interested in a bulk order for my business…");

/**
 * Cut-out bottles that take turns in the hero, starting with the gold dish
 * wash (the strongest colour against the logo blue) and ordered so similar
 * colours never follow each other. The light behind each one takes on its
 * colour. Washing powder has no cut-out yet, so it sits this out.
 * Requested at their native 500px; anything larger only upscales.
 */
const HERO_BOTTLES = [
  { name: 'Dish wash', path: 'v1769461877/4_nlecjj', glow: ACCENTS.gold.solid },
  { name: 'Glass cleaner', path: 'v1769461878/6_ek3cwb', glow: ACCENTS.cyan.solid },
  { name: 'Sweep cleaner', path: 'v1769461877/3_lfjeod', glow: ACCENTS.clay.solid },
  { name: 'Liquid detergent', path: 'v1769461880/8_lgiswx', glow: ACCENTS.cyan.solid },
  { name: 'Phenyl', path: 'v1769461877/2_gjkqik', glow: ACCENTS.gold.solid },
  { name: 'Toilet cleaner', path: 'v1769461877/5_p5xx5m', glow: ACCENTS.cyan.solid },
  { name: 'Hand wash', path: 'v1769461877/1_evgktx', glow: ACCENTS.teal.solid },
].map((bottle) => ({
  ...bottle,
  src: `https://res.cloudinary.com/dztldh7o2/image/upload/f_auto,q_auto,w_500/${bottle.path}.png`,
}));

/** How long each bottle rests once it has landed, before the next swings in. */
const BOTTLE_HOLD_MS = 1000;

const preloaded = new Map<string, Promise<void>>();
/** Resolves once an image is downloaded, so a bottle never swings in half-loaded. */
function preload(src: string) {
  let pending = preloaded.get(src);
  if (!pending) {
    pending = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
    preloaded.set(src, pending);
  }
  return pending;
}

const CLAIMS: { heading: string; body: string; icon: LucideIcon; color: string; tint: string }[] = [
  {
    heading: 'Nothing harsh in the bottle',
    body: 'Non-toxic, biodegradable formulas. No bleach, no ammonia, no fumes left hanging in the room.',
    icon: ShieldCheck,
    color: ACCENTS.teal.solid,
    tint: ACCENTS.teal.tint,
  },
  {
    heading: 'Safe around kids and pets',
    body: 'Made to be used in a home where someone small is always underfoot.',
    icon: Baby,
    color: ACCENTS.gold.solid,
    tint: ACCENTS.gold.tint,
  },
  {
    heading: '10× power on grease',
    body: 'The cleaning still has to work. Every bottle is built for the worst job in the house.',
    icon: Zap,
    color: ACCENTS.clay.solid,
    tint: ACCENTS.clay.tint,
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  // The selected category lives in the URL so a filtered view can be shared
  // on WhatsApp and survives a refresh.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') ?? 'all';
  const query = (searchParams.get('q') ?? '').trim();
  const location = useLocation();

  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // The signature moment: as the hero scrolls away the bottle lifts and swings
  // a little further over, as if it's being picked up.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bottleY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const bottleRotate = useTransform(scrollYProgress, [0, 1], [8, 17]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);

  // The bottles take turns: each rises in, rests for a second, then swings
  // out for the next. They wait while the hero is off screen, and stop for
  // good if the visitor pauses them or has asked for less motion.
  const [bottleIndex, setBottleIndex] = useState(0);
  const [bottleLanded, setBottleLanded] = useState(false);
  const [bottlesPaused, setBottlesPaused] = useState(false);
  const firstBottle = useRef(true);
  const heroInView = useInView(heroRef, { amount: 0.25 });
  const bottlesCycling = !reduceMotion && !bottlesPaused && heroInView;
  const bottle = HERO_BOTTLES[bottleIndex];

  useEffect(() => {
    if (!bottleLanded || !bottlesCycling) return;
    const next = (bottleIndex + 1) % HERO_BOTTLES.length;
    const ready = preload(HERO_BOTTLES[next].src);
    let cancelled = false;
    const timer = window.setTimeout(() => {
      ready.then(() => {
        if (cancelled) return;
        firstBottle.current = false;
        setBottleLanded(false);
        setBottleIndex(next);
      });
    }, BOTTLE_HOLD_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [bottleLanded, bottlesCycling, bottleIndex]);

  // The hero already has a WhatsApp button, and on a phone the floating one
  // would sit on top of the delivery promise in the first screen. Bring it in
  // only once the hero's own button has scrolled away.
  const [pastHero, setPastHero] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setPastHero(v > 0.8));
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const io = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);
  const showFab = pastHero && !footerInView;

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

  const visibleProducts = useMemo(() => {
    const needle = query.toLowerCase();
    const list = products.filter(
      (p) =>
        (selectedCategory === 'all' || p.category === selectedCategory) &&
        (!needle || `${p.title} ${p.category}`.toLowerCase().includes(needle))
    );
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, selectedCategory, sortBy, query]);

  const priceRange = useMemo(() => {
    if (!products.length) return null;
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  useEffect(() => {
    if (isLoading || location.hash !== '#products') return;
    document.getElementById('products')?.scrollIntoView({ behavior: 'auto' });
  }, [isLoading, location.hash, location.search]);

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const chooseCategory = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'all') next.delete('category');
    else next.set('category', category);
    setSearchParams(next, { replace: true });
    document.getElementById('products')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: EASE },
        };

  const chip = (active: boolean) =>
    `inline-flex items-center min-h-11 px-4 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
      active
        ? 'bg-white text-primary-600 font-semibold'
        : 'text-white border border-white/60 hover:bg-white/10'
    }`;

  return (
    <div className="bg-surface">
      <SEO
        title="Home"
        description="Non-toxic cleaners for every job in the house, made in Pakistan and delivered in Islamabad and Rawalpindi. Pay on delivery."
      />

      {/* Everything up to the end of the range shares one container, so the
          category bar stays pinned while you browse products and lets go
          before the claims and footer. */}
      <div>
        <nav
          aria-label="Product categories"
          className="sticky top-14 z-40 bg-primary-600 shadow-[0_1px_0_0_#1757d1]"
        >
          <div className="container mx-auto flex items-center gap-2 px-4 pt-1 pb-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => chooseCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={chip(selectedCategory === 'all')}
            >
              Everything
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => chooseCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={chip(selectedCategory === cat)}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </nav>

        {/* ------------------------------------------------------------ HERO */}
        <section ref={heroRef} className="relative overflow-hidden bg-primary-600 isolate">
          {/* Gold light coming off the bottle into the blue */}
          <motion.div
            aria-hidden
            className="absolute -bottom-24 -right-24 w-[420px] h-[420px] md:w-[620px] md:h-[620px] rounded-full -z-10 blur-[80px] opacity-60"
            style={{
              background: 'radial-gradient(circle, var(--glow) 0%, transparent 70%)',
              scale: reduceMotion ? 1 : glowScale,
            }}
            initial={{ ['--glow' as string]: HERO_BOTTLES[0].glow }}
            animate={{ ['--glow' as string]: bottle.glow }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />

          <div className="container mx-auto px-4 pt-12 pb-36 md:pt-20 md:pb-28">
            {/* The headline is the largest thing on the page, so it isn't
                faded in — that would hold back the first paint on the cheap
                Android phones most customers use. It lands instantly and the
                rest of the hero arrives around it. */}
            <h1 className="font-display font-extrabold text-white text-[clamp(3rem,14vw,5.75rem)] leading-[0.95] max-w-[12ch]">
              Cleaners for every job in the house.
            </h1>

            <motion.p
              {...rise(0.08)}
              className="mt-5 text-[15px] md:text-lg leading-relaxed text-white/85 max-w-[17rem] md:max-w-md"
            >
              8 non-toxic cleaners, made in Pakistan. Delivered in Islamabad and Rawalpindi.
            </motion.p>

            <motion.div
              {...rise(0.2)}
              className="mt-8 flex flex-col md:flex-row gap-3 w-[min(248px,68vw)] md:w-auto"
            >
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 bg-white text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-primary-50 active:scale-95 transition-[background-color,transform]"
              >
                Shop the range
              </a>
              <a
                href={`${WHATSAPP}?text=${ORDER_TEXT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-white font-semibold px-6 py-3.5 rounded-full border border-white/35 hover:bg-white/10 active:scale-95 transition-[background-color,transform]"
              >
                <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
                Order on WhatsApp
              </a>
            </motion.div>

            {/* A price sticker floating in the space under the buttons. The
                small line is set above the big one but read after it. */}
            <motion.div {...rise(0.32)} className="mt-7 md:mt-9">
              <motion.p
                className="inline-flex flex-col-reverse items-start px-4 py-2.5 rounded-2xl bg-accent-300 text-ink shadow-[0_14px_28px_-14px_rgba(10,27,61,0.6)]"
                style={{ rotate: -4 }}
                animate={bottlesCycling ? { y: [0, -7, 0] } : { y: 0 }}
                transition={bottlesCycling ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
              >
                <span className="font-display font-extrabold text-[22px] md:text-[26px] leading-tight">Free delivery</span>
                <span className="text-[12px] md:text-[13px] font-semibold text-ink/75 tabular">
                  {formatRs(FREE_DELIVERY_FROM)} &amp; above
                </span>
              </motion.p>
            </motion.div>
          </div>

          {/* The bottle breaks out of the bottom-right corner. The outer layer
              follows the scroll, the inner one does the entrance, so the two
              never fight over the same transform. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-7 -right-[84px] w-[290px] md:w-[460px] md:-right-16 md:-bottom-28 lg:right-[6%]"
            style={reduceMotion ? { rotate: 8 } : { y: bottleY, rotate: bottleRotate }}
          >
            <AnimatePresence mode="wait" initial={!reduceMotion}>
              <motion.img
                key={bottle.src}
                src={bottle.src}
                alt=""
                width={500}
                height={500}
                decoding="async"
                className="w-full h-auto object-contain drop-shadow-[-12px_24px_32px_rgba(10,27,61,0.35)]"
                variants={{
                  hidden: { opacity: 0, y: 140, rotate: 14 },
                  shown: {
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                    transition: firstBottle.current
                      ? { type: 'spring', stiffness: 70, damping: 16, delay: 0.35 }
                      : { type: 'spring', stiffness: 120, damping: 16 },
                  },
                  // Swings out the way the next one swings in.
                  gone: { opacity: 0, x: -50, y: -24, rotate: -16, transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } },
                }}
                initial={reduceMotion ? false : 'hidden'}
                animate="shown"
                exit="gone"
                onAnimationComplete={(definition) => definition === 'shown' && setBottleLanded(true)}
              />
            </AnimatePresence>
          </motion.div>

          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setBottlesPaused((paused) => !paused)}
              aria-label={bottlesPaused ? 'Play the product animation' : 'Pause the product animation'}
              className="absolute bottom-3 left-3 z-10 w-11 h-11 grid place-items-center rounded-full text-white"
            >
              <span className="w-8 h-8 grid place-items-center rounded-full bg-ink/30 hover:bg-ink/50 transition-colors">
                {bottlesPaused ? <Play className="w-3.5 h-3.5" fill="currentColor" aria-hidden /> : <Pause className="w-3.5 h-3.5" fill="currentColor" aria-hidden />}
              </span>
            </button>
          )}
        </section>

        {/* ---------------------------------------------------- REASSURANCE */}
        <Reassurance />

        {/* ------------------------------------------------------- THE RANGE */}
        <section id="products" aria-labelledby="range-heading" className="py-12 md:py-20 scroll-mt-[120px]">
          <div className="container mx-auto px-4 mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 id="range-heading" className="font-display font-extrabold text-ink text-3xl md:text-4xl">
                The range
              </h2>
              {query ? (
                <p className="mt-2 text-[15px] text-ink/70 flex flex-wrap items-center gap-x-2">
                  <span>
                    {visibleProducts.length} {visibleProducts.length === 1 ? 'result' : 'results'} for “{query}”
                  </span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="inline-flex items-center gap-1 min-h-11 font-semibold text-primary-700 hover:underline"
                  >
                    <X className="w-4 h-4" aria-hidden /> Clear search
                  </button>
                </p>
              ) : (
              <p className="mt-2 text-[15px] text-ink/70 tabular">
                {priceRange
                  ? `${products.length} cleaners, ${formatRs(priceRange.min)} to ${formatRs(priceRange.max)}.`
                  : 'Everyday cleaners for the whole house.'}
              </p>
              )}
            </div>

            {products.length > 1 && (
              <label className="shrink-0">
                <span className="sr-only">Sort products</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="min-h-11 bg-white text-ink border border-ink/15 rounded-full pl-3 pr-8 text-[13px] font-medium"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            )}
          </div>

          <div aria-live="polite" className="md:container md:mx-auto md:px-4">
            {isLoading ? (
              <div className="md:grid md:grid-cols-2 md:gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`px-4 py-7 md:rounded-3xl ${i % 2 ? 'bg-white' : 'bg-ink/[0.04]'}`}>
                    <div className="flex items-center gap-5">
                      <div className="w-[132px] aspect-square rounded-2xl bg-ink/[0.07] animate-pulse" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-3 w-20 rounded bg-ink/[0.07] animate-pulse" />
                        <div className="h-5 w-full rounded bg-ink/[0.07] animate-pulse" />
                        <div className="h-5 w-16 rounded bg-ink/[0.07] animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <h3 className="font-display font-bold text-xl text-ink">
                  {query ? `Nothing matches “${query}”` : 'Nothing in this category yet'}
                </h3>
                <p className="mt-2 text-ink/70">
                  {query ? 'Try a shorter word, like “glass” or “floor”.' : 'Everything else in the range is one tap away.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                  className="mt-5 bg-primary-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-700 transition-colors"
                >
                  Show everything
                </button>
              </div>
            ) : (
              <div className="md:grid md:grid-cols-2 md:gap-5">
                {visibleProducts.map((product, i) => (
                  <ProductRow key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------------- CLAIMS */}
      <section aria-labelledby="claims-heading" className="bg-ink">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <h2 id="claims-heading" className="sr-only">
            Why Onium
          </h2>
          <ul className="grid gap-9 md:grid-cols-3 md:gap-10">
            {CLAIMS.map(({ heading, body, icon: Icon, color, tint }, i) => (
              <motion.li
                key={heading}
                className="flex gap-4 items-start"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
              >
                <span
                  aria-hidden
                  className="w-12 h-12 rounded-full grid place-items-center shrink-0"
                  style={{ backgroundColor: `${color}4d`, color: tint }}
                >
                  <Icon className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-white text-xl leading-snug">{heading}</h3>
                  <p className="mt-1 text-[14px] text-white/75 leading-relaxed">{body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ BULK */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="rounded-[2rem] bg-white p-7 md:p-12 border border-ink/10">
          <div className="max-w-lg">
            <h2 className="font-display font-extrabold text-ink text-2xl md:text-4xl leading-tight">
              Buying for an office, a mosque or a restaurant?
            </h2>
            <p className="mt-3 text-[15px] text-ink/70 leading-relaxed">
              We do wholesale pricing, bulk packs and regular scheduled deliveries. Send us a message
              and we will put a quote together.
            </p>
            <a
              href={`${WHATSAPP}?text=${BULK_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-primary-600 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-primary-700 active:scale-95 transition-[background-color,transform]"
            >
              <MessageCircle className="w-[18px] h-[18px]" aria-hidden />
              Ask for bulk pricing
            </a>
          </div>
        </div>
      </section>

      {/* Lifted clear of the home indicator on notched phones */}
      <AnimatePresence>
        {showFab && (
      <motion.a
        initial={reduceMotion ? false : { opacity: 0, scale: 0.6, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        href={`${WHATSAPP}?text=${ORDER_TEXT}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Onium on WhatsApp"
        className="fixed z-40 right-5 w-14 h-14 rounded-full bg-[#1DA851] text-white grid place-items-center shadow-[0_8px_20px_rgba(29,168,81,0.35)]"
        whileHover={reduceMotion ? undefined : { scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <MessageCircle className="w-6 h-6" aria-hidden />
      </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
