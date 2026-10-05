import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { Product } from '../lib/supabase';
import { accentFor } from '../lib/productAccents';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  /** Index in the grid; the first row is eager so the LCP image isn't delayed. */
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const accent = accentFor(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const hasDiscount = (product.discount || 0) > 0;
  const finalPrice = hasDiscount ? product.price * (1 - (product.discount || 0) / 100) : product.price;
  const soldOut = product.stock === 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block focus-visible:ring-2 focus-visible:ring-primary-600 rounded-3xl"
    >
      {/* The photography is the product. It fills the tile edge to edge, on a
          wash of the colour sampled from that same photo. */}
      <div
        className="relative aspect-[4/5] rounded-3xl overflow-hidden"
        style={{ backgroundColor: accent.tint }}
      >
        <img
          src={product.image_url}
          alt={product.title}
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-clay-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tabular">
            {product.discount}% off
          </span>
        )}

        {soldOut && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-ink text-white text-sm font-semibold px-4 py-2 rounded-full">Sold out</span>
          </div>
        )}

        {!soldOut && (
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
            className={`absolute bottom-3 right-3 w-11 h-11 rounded-full grid place-items-center shadow-lg transition-all duration-200 active:scale-90 ${
              isAdded ? 'bg-leaf-600 text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
            }`}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="pt-3 px-0.5">
        <p className="text-xs font-medium mb-1" style={{ color: accent.deep }}>
          {product.category}
        </p>
        <h3 className="font-display font-bold text-ink text-[15px] leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-primary-700 transition-colors">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display font-bold text-ink text-lg tabular">
            Rs {finalPrice.toFixed(0)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-ink/40 line-through tabular">Rs {product.price.toFixed(0)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
