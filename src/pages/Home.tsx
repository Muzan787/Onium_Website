import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { ACCENTS } from '../lib/productAccents';
import SEO from '../components/SEO';

const WHATSAPP = 'https://wa.me/923231550147';

/**
 * The range as a shelf. These are the cut-out bottles, ordered warm to cool so
 * the lineup reads as one spectrum, each paired with a glow taken from its own
 * liquid. Nothing sits on top of a photograph, so the colour stays vivid and
 * the type gets clean space.
 */
const HERO_BOTTLES = [
  { src: 'v1769461877/4_nlecjj.png', glow: '#e0b400' },
  { src: 'v1769461877/2_gjkqik.png', glow: '#c9a227' },
  { src: 'v1769461877/3_lfjeod.png', glow: '#c74b52' },
  { src: 'v1769461877/1_evgktx.png', glow: '#4e8f96' },
  { src: 'v1769461878/6_ek3cwb.png', glow: '#2e9ad0' },
  { src: 'v1769461880/8_lgiswx.png', glow: '#3f6fd8' },
  { src: 'v1769461878/7_rh53s3.png', glow: '#8a9a5b' },
  { src: 'v1769461877/5_p5xx5m.png', glow: '#1f47a8' },
];

const bottleUrl = (src: string) =>
  `https://res.cloudinary.com/dztldh7o2/image/upload/f_auto,q_auto,h_520/${src}`;

/** The three things worth saying, each carrying one colour from the range. */
const CLAIMS = [
  {
    heading: 'Nothing harsh in the bottle',
    body: 'Non-toxic, biodegradable formulas. No bleach, no ammonia, no fumes left hanging in the room.',
    color: ACCENTS.teal.solid,
  },
  {
    heading: 'Safe around kids and pets',
    body: 'Made to be used in a home where someone small is always underfoot.',
    color: ACCENTS.gold.solid,
  },
  {
    heading: '10× power on grease',
    body: 'The cleaning still has to work. Every bottle is built for the worst job in the house.',
    color: ACCENTS.clay.solid,
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [stats, setStats] = useState({ average: 0, total: 0 });

  const reduceMotion = useReducedMotion();
  const claimsRef = useRef<HTMLDivElement>(null);

  // The signature moment: scrolling the claims band lights the page with each
  // product colour in turn. These are cross-fading glows over a constant ink
  // base rather than an animated background colour — interpolating teal to
  // gold to clay in RGB goes through mud, and white type on a gold field is
  // nowhere near readable.
  const { scrollYProgress } = useScroll({
    target: claimsRef,
    offset: ['start end', 'end start'],
  });
  const glow1 = useTransform(scrollYProgress, [0.05, 0.25, 0.42], [0, 0.5, 0]);
  const glow2 = useTransform(scrollYProgress, [0.3, 0.5, 0.68], [0, 0.5, 0]);
  const glow3 = useTransform(scrollYProgress, [0.55, 0.75, 0.95], [0, 0.5, 0]);
  const glows = [glow1, glow2, glow3];

  useEffect(() => {
    fetchGlobalStats();
    fetchProducts();
  }, []);

  const fetchGlobalStats = async () => {
    const { data } = await supabase.from('reviews').select('rating').eq('is_approved', true);
    if (data && data.length > 0) {
      const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
      setStats({ average: parseFloat(avg.toFixed(1)), total: data.length });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
      setCategories(Array.from(new Set((data || []).map((p) => p.category))));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory !== 'all') filtered = filtered.filter((p) => p.category === selectedCategory);
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, selectedCategory, sortBy]);

  const cheapest = useMemo(
    () => (products.length ? Math.min(...products.map((p) => p.price)) : null),
    [products]
  );

  const ease = [0.16, 1, 0.3, 1] as const;
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease },
        };

  return (
    <div className="bg-surface">
      <SEO title="Home" description="Premium eco-friendly cleaning solutions for a safer, sparklier home." />

      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative min-h-[78svh] flex flex-col overflow-hidden isolate">
        {/* Ink deepening into brand blue, so the field brightens down toward
            the shelf rather than sitting flat. */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'linear-gradient(176deg, #081634 0%, #0b1f4a 34%, #102a63 62%, #16387f 100%)',
          }}
        />
        {/* A single cool highlight so the top corner isn't dead flat. */}
        <div
          className="absolute -top-32 -right-24 w-[70vw] h-[70vw] max-w-[520px] max-h-[520px] rounded-full blur-[110px] opacity-40 -z-10"
          style={{ background: 'radial-gradient(circle, #2e6bff 0%, transparent 70%)' }}
          aria-hidden
        />

        <div className="relative container mx-auto px-4 pt-14 sm:pt-20">
          <motion.h1
            {...rise(0.05)}
            className="font-display font-extrabold text-white text-[clamp(2.6rem,12vw,5.5rem)] leading-[0.92] max-w-[14ch]"
          >
            Every job in the house.
          </motion.h1>

          <motion.p
            {...rise(0.18)}
            className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed max-w-md"
          >
            Eight non-toxic cleaners, made in Pakistan. Delivered across Islamabad
            and Rawalpindi.
          </motion.p>

          <motion.div {...rise(0.3)} className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#products"
              className="inline-flex items-center gap-2 bg-white text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-primary-50 active:scale-95 transition-all"
            >
              Shop the range
              {cheapest !== null && (
                <span className="text-ink/45 tabular">from Rs {cheapest.toFixed(0)}</span>
              )}
            </a>
            <a
              href={`${WHATSAPP}?text=Asalamo%20Alikum%2C%20I%20want%20to%20order...`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/25 text-white font-semibold px-5 py-3.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </motion.div>
        </div>

        {/* The shelf. Bottles are bottom-aligned and the row runs wider than the
            screen, so the range reads as continuing past both edges. */}
        <div className="relative mt-auto pt-6 w-full">
          <div className="relative flex items-end justify-center px-2">
            {HERO_BOTTLES.map((bottle, i) => (
              <motion.div
                key={bottle.src}
                className={[
                  'relative shrink-0',
                  i > 0 ? '-ml-12 sm:-ml-10 lg:-ml-8' : '',
                  i >= 5 ? 'hidden lg:block' : i >= 3 ? 'hidden sm:block' : '',
                ].join(' ')}
                initial={reduceMotion ? false : { opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.42 + i * 0.07, ease }}
              >
                {/* Each bottle lights the field with the colour of its own liquid */}
                <span
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[150%] aspect-square rounded-full blur-[42px] opacity-55 -z-10"
                  style={{ background: `radial-gradient(circle, ${bottle.glow} 0%, transparent 68%)` }}
                />
                <motion.img
                  src={bottleUrl(bottle.src)}
                  alt=""
                  aria-hidden
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="block w-auto h-[clamp(190px,50vw,280px)] object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]"
                  animate={
                    reduceMotion
                      ? undefined
                      : { y: [0, -7, 0] }
                  }
                  transition={{
                    duration: 5.5 + i * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.25,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Grounds the shelf so the bottles don't float on nothing */}
          <div
            className="h-14 sm:h-20 w-full"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(8,22,52,0) 0%, rgba(8,22,52,0.55) 55%, #081634 100%)',
            }}
            aria-hidden
          />
        </div>
      </section>

      {/* The three reassurances a first-time buyer actually wants, on their own
          line rather than floating in a shadowed card. */}
      <div className="bg-white border-b border-ink/10">
        <div className="container mx-auto px-4 grid grid-cols-3 divide-x divide-ink/10">
          {[
            ['Pay on delivery', 'Cash or transfer'],
            ['Free delivery', 'Over Rs 3,000'],
            ['1–3 days', 'Isb & Rwp'],
          ].map(([title, sub]) => (
            <div key={title} className="py-4 px-2 text-center">
              <p className="text-[13px] sm:text-sm font-semibold text-ink leading-tight">{title}</p>
              <p className="text-[11px] sm:text-xs text-ink/50 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- THE RANGE */}
      <section id="products" className="container mx-auto px-4 py-14 sm:py-20 scroll-mt-16">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="font-display font-extrabold text-ink text-3xl sm:text-4xl">The range</h2>
            <p className="text-ink/55 mt-1.5 text-sm sm:text-base">
              {products.length || 'Eight'} cleaners, one for every job in the house.
            </p>
          </div>

          {stats.total > 0 && (
            <div className="hidden sm:flex items-center gap-2 shrink-0 pb-1">
              <Star className="w-4 h-4 text-accent-500 fill-current" />
              <span className="font-semibold text-ink tabular">{stats.average}</span>
              <span className="text-ink/50 text-sm">from {stats.total} reviews</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-7 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-ink text-white'
                : 'bg-white text-ink/70 border border-ink/10 hover:border-ink/25'
            }`}
          >
            Everything
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-ink text-white'
                  : 'bg-white text-ink/70 border border-ink/10 hover:border-ink/25'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] rounded-3xl bg-ink/[0.06] animate-pulse" />
                <div className="h-3 w-20 bg-ink/[0.06] rounded mt-3 animate-pulse" />
                <div className="h-4 w-full bg-ink/[0.06] rounded mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="font-display font-bold text-xl text-ink">Nothing in this category yet</h3>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-3 text-primary-700 font-semibold hover:underline"
            >
              Show everything
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {visibleProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8 flex justify-end">
            <label className="text-sm text-ink/55 flex items-center gap-2">
              Sort
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-ink/10 rounded-full px-3 py-2 text-sm font-medium text-ink"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price, low to high</option>
                <option value="price-high">Price, high to low</option>
              </select>
            </label>
          </div>
        )}
      </section>

      {/* ------------------------------------------------- CLAIMS / COLOUR FIELD */}
      <section ref={claimsRef} className="relative bg-ink overflow-hidden">
        {!reduceMotion &&
          CLAIMS.map((claim, i) => (
            <motion.div
              key={`glow-${claim.heading}`}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-[70svh] blur-[90px]"
              style={{
                opacity: glows[i],
                top: `${i * 30}%`,
                background: `radial-gradient(60% 50% at 50% 50%, ${claim.color} 0%, transparent 70%)`,
              }}
            />
          ))}

        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            {CLAIMS.map((claim) => (
              <div
                key={claim.heading}
                className="min-h-[42svh] flex flex-col justify-center border-t border-white/20 py-10"
              >
                <span
                  className="w-12 h-1.5 rounded-full mb-5"
                  style={{ backgroundColor: claim.color }}
                  aria-hidden
                />
                <h3 className="font-display font-extrabold text-white text-[clamp(1.75rem,6.5vw,3rem)] leading-[1.02]">
                  {claim.heading}
                </h3>
                <p className="mt-3 text-white/70 text-base sm:text-lg leading-relaxed max-w-lg">
                  {claim.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ BULK ORDERS */}
      <section className="bg-surface py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-[2rem] bg-white border border-ink/10 p-8 sm:p-14">
            <div className="max-w-lg">
              <h2 className="font-display font-extrabold text-ink text-3xl sm:text-4xl leading-tight">
                Buying for an office, a mosque or a restaurant?
              </h2>
              <p className="mt-4 text-ink/60 leading-relaxed">
                We do wholesale pricing, bulk packs and regular scheduled deliveries.
                Send us a message and we will put a quote together.
              </p>
              <a
                href={`${WHATSAPP}?text=I'm%20interested%20in%20bulk%20order%20for%20business...`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-primary-700 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Ask for bulk pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sits above the sticky footer area on mobile without covering content */}
      <a
        href={`${WHATSAPP}?text=Asalamo%20Alikum%2C%20I%20want%20to%20order...`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Onium on WhatsApp"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </div>
  );
}
