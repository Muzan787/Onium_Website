import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Leaf, Shield, Truck, Check } from 'lucide-react';
import { Product, supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase.from('reviews').select('rating').eq('product_id', product.id).eq('is_approved', true);
      if (data && data.length > 0) {
        const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
        setAvgRating(parseFloat(avg.toFixed(1)));
      }
    };
    fetchRating();
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-600' };
    if (product.stock <= 5) return { text: `Only ${product.stock} left`, color: 'bg-accent-500', textColor: 'text-accent-600' };
    return { text: 'In Stock', color: 'bg-primary-500', textColor: 'text-primary-600' };
  };

  const stockStatus = getStockStatus();

  // FIX: Ensure this is a true boolean to prevent "0" from rendering on screen
  const hasDiscount = (product.discount || 0) > 0;
  
  const finalPrice = hasDiscount 
    ? product.price * (1 - (product.discount || 0) / 100) 
    : product.price;

  return (
    <div className="group relative">
      <Link
        to={`/product/${product.slug  }`}
        className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary-200"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-50 group-hover:bg-primary-50/30 transition-colors">
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy" 
            className="w-full h-full object-contain p-4 md:p-6 group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* TOP LEFT: Category Badge */}
          <div className="hidden sm:block absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full capitalize shadow-sm border border-primary-100">
              {product.category}
            </span>
          </div>

          {/* TOP RIGHT CONTAINER: Discount & Stock */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2 items-end z-10">
            {/* 1. Discount Badge (Primary) */}
            {hasDiscount && (
              <div className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                {product.discount}% OFF
              </div>
            )}

            {/* 2. Low Stock Badge (Secondary, below discount) */}
            {product.stock <= 10 && product.stock > 0 && (
              <div className={`${stockStatus.color} text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                {stockStatus.text}
              </div>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-slate-900 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-lg font-bold">
                Out of Stock
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2 md:p-3 rounded-full shadow-xl transition-all duration-300 ${
              product.stock === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : isAdded
                  ? 'bg-primary-600 text-white scale-110'
                  : 'bg-white text-primary-600 hover:bg-primary-600 hover:text-white border border-primary-100'
            } opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10`}
          >
            {isAdded ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          <div className="hidden xs:flex absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full items-center gap-1 shadow-sm border border-slate-100">
            <Star className="w-3.5 h-3.5 text-accent-400 fill-current" />
            <span className="text-xs font-bold text-slate-700">{avgRating || 'New'}</span>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <h3 className="font-bold text-slate-900 text-sm md:text-lg mb-1 md:mb-2 line-clamp-2 h-10 md:h-14 group-hover:text-primary-600 transition-colors">
            {product.title}
          </h3>

          <p className="hidden sm:block text-slate-500 text-sm mb-4 line-clamp-2 h-10">
            {product.description}
          </p>

          <div className="hidden sm:flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-primary-500" /><span className="text-xs text-slate-500">Eco</span></div>
            <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-secondary-500" /><span className="text-xs text-slate-500">Safe</span></div>
            <div className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-accent-500" /><span className="text-xs text-slate-500">Fast</span></div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2">
                <span className="text-lg md:text-xl font-bold text-slate-900">
                  Rs{finalPrice.toFixed(0)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    Rs{product.price.toFixed(0)}
                  </span>
                )}
              </div>
              
              {hasDiscount ? (
                <div className="text-[10px] md:text-xs text-green-600 font-bold mt-0.5">
                  Save Rs{(product.price - finalPrice).toFixed(0)}
                </div>
              ) : (
                <div className="text-[10px] md:text-xs text-primary-600 font-bold flex items-center gap-1 mt-0.5">
                  Best Price
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}