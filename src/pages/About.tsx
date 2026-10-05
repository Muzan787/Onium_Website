import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { accentFor } from '../lib/productAccents';
import { formatRs } from '../lib/format';
import { describeTitle } from '../lib/productInfo';
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from '../lib/pricing';
import { ADDRESS, MAP_URL, SUPPORT_HOURS } from '../lib/contact';
import SEO from '../components/SEO';
import PageIntro from '../components/PageIntro';

/** Promises the rest of the site already makes, gathered in one place. */
const PROMISES = [
  {
    title: 'Pay when it arrives',
    body: 'Pay on delivery, by bank transfer or cash. Nothing up front.',
  },
  {
    title: 'Delivered in Islamabad and Rawalpindi',
    body: `Free from ${formatRs(FREE_DELIVERY_FROM)}, otherwise ${formatRs(DELIVERY_FEE)}.`,
    link: { to: '/shipping-policy', label: 'Shipping policy' },
  },
  {
    title: 'Real people on WhatsApp',
    body: `Questions about an order or which cleaner to use, ${SUPPORT_HOURS}.`,
    link: { to: '/contact', label: 'Contact us' },
  },
  {
    title: 'Returns within 7 days',
    body: 'Damaged, wrong, or not doing the job? Tell us within 7 days of delivery.',
    link: { to: '/return-policy', label: 'Returns policy' },
  },
];

export default function About() {
  const [range, setRange] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at')
      .then(({ data }) => setRange(data ?? []));
  }, []);

  return (
    <div>
      <SEO title="About us" description="Onium makes everyday cleaning products in Pakistan, without the harsh chemicals." />

      <PageIntro
        title="About Onium"
        lede="Everyday cleaning products made in Pakistan, without the harsh chemicals."
      >
        {/* The range itself is the best picture of what Onium is. */}
        {range.length > 0 && (
          <ul className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
            {range.slice(0, 8).map((product) => (
              <li key={product.id}>
                <Link
                  to={`/product/${product.slug}`}
                  state={{ product }}
                  className="block aspect-square rounded-2xl overflow-hidden ring-1 ring-white/15 hover:ring-white/60 transition-shadow"
                  style={{ backgroundColor: accentFor(product).tint }}
                >
                  <img
                    src={product.image_url}
                    alt={describeTitle(product).name}
                    width={160}
                    height={160}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageIntro>

      <section className="container mx-auto px-4 py-14 md:py-24 md:grid md:grid-cols-12 md:gap-12">
        <h2 className="md:col-span-5 font-display font-extrabold text-ink text-[32px] md:text-5xl leading-none">
          Why we started
        </h2>
        <div className="md:col-span-7 mt-5 md:mt-0 max-w-prose text-[17px] md:text-lg leading-relaxed text-ink/80 space-y-5">
          <p>
            Onium was founded to close the gap between powerful industrial cleaning and products that are safe to
            use at home. You shouldn't have to choose between a clean home and a safe one.
          </p>
          <p>Our formulas are biodegradable, non-toxic, and made to shift stubborn stains.</p>
        </div>
      </section>

      <section aria-labelledby="promises-heading" className="bg-white border-y border-ink/10">
        <div className="container mx-auto px-4 py-14 md:py-24">
          <h2 id="promises-heading" className="font-display font-extrabold text-ink text-[32px] md:text-5xl leading-none">
            What you can count on
          </h2>
          <ul className="mt-8 md:mt-12 border-t border-ink/10 md:grid md:grid-cols-2 md:gap-x-12">
            {PROMISES.map(({ title, body, link }) => (
              <li key={title} className="border-b border-ink/10 py-6 md:py-8">
                <h3 className="font-display font-bold text-ink text-xl md:text-2xl">{title}</h3>
                <p className="mt-2 text-[16px] text-ink/75 leading-relaxed">{body}</p>
                {link && (
                  <Link
                    to={link.to}
                    className="mt-2 inline-flex items-center min-h-11 text-sm font-semibold text-primary-700 underline underline-offset-4 decoration-primary-700/30 hover:decoration-primary-700"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20">
        <h2 className="font-display font-extrabold text-ink text-[28px] md:text-4xl">Find us</h2>
        <p className="mt-3 flex items-start gap-3 text-[17px] text-ink/80">
          <MapPin className="w-5 h-5 mt-1 shrink-0 text-primary-600" aria-hidden />
          {ADDRESS}
        </p>
        <a
          href={MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center min-h-12 px-6 rounded-full border border-ink/15 text-ink font-semibold hover:bg-white transition-colors"
        >
          Open in Google Maps
        </a>
      </section>
    </div>
  );
}
