import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { ACCENTS } from '../lib/productAccents';
import SEO from '../components/SEO';

const WHATSAPP = 'https://wa.me/923231550147';

/** Cloudinary can resize and re-encode on the fly; the originals are 1000px squares. */
const cld = (url: string, t: string) =>
  url.includes('/upload/') ? url.replace('/upload/', `/upload/${t}/`) : url;

const HERO_IMAGE =
  'https://res.cloudinary.com/dztldh7o2/image/upload/v1769886084/c3dethlgcl5b9ht7wxgn.jpg';

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
      <section className="relative min-h-[80svh] flex items-end overflow-hidden">
        <img
          src={cld(HERO_IMAGE, 'f_auto,q_auto,w_1200')}
          alt="Onium dish wash on a sunlit kitchen table"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '38% top' }}
          decoding="async"
        />
        {/* Opaque only where the type actually sits, so most of the frame stays
            a photograph rather than a dark slab. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(10,27,61,0.96) 0%, rgba(10,27,61,0.9) 22%, rgba(10,27,61,0.55) 42%, rgba(10,27,61,0.12) 66%, rgba(10,27,61,0) 100%)',
          }}
        />

        <div className="relative container mx-auto px-4 pb-12 pt-24">
          <div className="max-w-xl">
            <motion.h1
              {...rise(0.05)}
              className="font-display font-extrabold text-white text-[clamp(2.25rem,9vw,4.5rem)] leading-[0.95]"
            >
              10× the power.
              <br />
              None of the harsh stuff.
            </motion.h1>

            <motion.p {...rise(0.18)} className="mt-4 text-white/75 text-base sm:text-lg leading-relaxed max-w-sm">
              Eight everyday cleaners, delivered across Islamabad and Rawalpindi.
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
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-5 py-3.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </motion.div>
          </div>
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
