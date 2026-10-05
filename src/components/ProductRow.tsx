import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Product } from '../lib/supabase';
import { accentFor } from '../lib/productAccents';
import { categoryLabel, formatRs, splitTitle } from '../lib/format';
import { useCart } from '../context/CartContext';

interface ProductRowProps {
  product: Product;
  /** Position in the list. Even rows sit on the product's colour with the
   *  photo left; odd rows sit on white with the photo right, so scrolling the
   *  range alternates like turning pages. */
  index: number;
}

export default function ProductRow({ product, index }: ProductRowProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const reduceMotion = useReducedMotion();

  const accent = accentFor(product);
  const { name, detail } = splitTitle(product.title);
  const flipped = index % 2 === 1;
  const href = `/product/${product.slug}`;

  const hasDiscount = (product.discount || 0) > 0;
  const finalPrice = hasDiscount ? product.price * (1 - (product.discount || 0) / 100) : product.price;
  const soldOut = product.stock === 0;

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <article
      // Mobile: full-bleed bands alternating colour and white. From md up the
      // rows become cards in a grid, so each card simply wears its own colour.
      // overflow-hidden: the photo slides in from beyond the row's edge, and
      // until a row scrolls into view that offset would otherwise widen the
      // whole page and let it wobble sideways on a phone.
      className={[
        'px-4 py-7 md:p-6 md:rounded-3xl overflow-hidden',
        flipped ? 'bg-white md:bg-[var(--tint)]' : 'bg-[var(--tint)]',
      ].join(' ')}
      style={{ ['--tint' as string]: accent.tint }}
    >
      <div className={`flex items-center gap-5 ${flipped ? 'flex-row-reverse md:flex-row' : ''}`}>
        <motion.div
          className="w-[132px] md:w-[176px] shrink-0"
          initial={reduceMotion ? false : { opacity: 0, x: flipped ? 28 : -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to={href}
            tabIndex={-1}
            aria-hidden
            className="relative block aspect-square rounded-2xl overflow-hidden"
            style={{ backgroundColor: flipped ? accent.tint : 'rgba(255,255,255,0.45)' }}
          >
            <img
              src={product.image_url}
              alt=""
              width={264}
              height={264}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-2 left-2 bg-clay-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full tabular">
                {product.discount}% off
              </span>
            )}
          </Link>
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-1.5" style={{ color: accent.deep }}>
            {categoryLabel(product.category)}
          </p>
          <h3 className="font-display font-extrabold text-ink text-[21px] leading-[1.1]">
            <Link
              to={href}
              title={product.title}
              className="hover:text-primary-700 transition-colors focus-visible:underline"
            >
              {name}
            </Link>
          </h3>
          {detail && <p className="mt-1.5 text-[13px] text-ink/70 line-clamp-2">{detail}</p>}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-display font-bold text-xl text-ink tabular">{formatRs(finalPrice)}</span>
              {hasDiscount && (
                <span className="text-sm text-ink/65 line-through tabular">{formatRs(product.price)}</span>
              )}
            </div>

            {soldOut ? (
              <span className="shrink-0 text-xs font-semibold text-ink/70 bg-white/70 px-3 py-2 rounded-full">
                Sold out
              </span>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                aria-label={isAdded ? `${name} added to cart` : `Add ${name} to cart`}
                className={`shrink-0 w-11 h-11 rounded-full grid place-items-center text-white shadow-md transition-[background-color,transform] duration-200 active:scale-90 ${
                  isAdded ? 'bg-leaf-600' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isAdded ? <Check className="w-5 h-5" aria-hidden /> : <Plus className="w-5 h-5" aria-hidden />}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
