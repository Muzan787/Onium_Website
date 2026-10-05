import { useRef, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Product } from '../lib/supabase';
import { accentFor } from '../lib/productAccents';
import { formatRs } from '../lib/format';
import { describeTitle, finalPriceOf } from '../lib/productInfo';
import { useCart } from '../context/CartContext';
import ProductLink from './ProductLink';

/** A compact product card for the "more from the range" strip. */
export default function ProductTile({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const photoRef = useRef<HTMLAnchorElement>(null);

  const accent = accentFor(product);
  const { name } = describeTitle(product);
  const hasDiscount = (product.discount || 0) > 0;
  const soldOut = product.stock === 0;

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <article>
      <ProductLink
        ref={photoRef}
        product={product}
        photo={photoRef}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-square rounded-3xl overflow-hidden"
        style={{ backgroundColor: accent.tint }}
      >
        <img
          src={product.image_url}
          alt=""
          width={328}
          height={328}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-clay-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-full tabular">
            {product.discount}% off
          </span>
        )}
      </ProductLink>

      <h3 className="mt-3 px-0.5 font-display font-bold text-ink text-base leading-tight line-clamp-2 min-h-[2.5em]">
        <ProductLink
          product={product}
          photo={photoRef}
          title={product.title}
          className="hover:text-primary-700 transition-colors focus-visible:underline"
        >
          {name}
        </ProductLink>
      </h3>

      <div className="mt-1.5 pl-0.5 flex items-center justify-between gap-2">
        <span className="font-display font-bold text-ink tabular">{formatRs(finalPriceOf(product))}</span>
        {soldOut ? (
          <span className="text-xs font-semibold text-ink/70">Sold out</span>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={isAdded ? `${name} added to cart` : `Add ${name} to cart`}
            className={`shrink-0 w-11 h-11 rounded-full grid place-items-center text-white transition-[background-color,transform] duration-200 active:scale-90 ${
              isAdded ? 'bg-leaf-600' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isAdded ? <Check className="w-5 h-5" aria-hidden /> : <Plus className="w-5 h-5" aria-hidden />}
          </button>
        )}
      </div>
    </article>
  );
}
