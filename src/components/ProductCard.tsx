import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Leaf, Shield, Truck } from 'lucide-react';
import { Product, supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id)
        .eq('is_approved', true);
      
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
  };

  // Determine stock status
  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-600' };
    if (product.stock <= 5) return { text: `Only ${product.stock} left`, color: 'bg-orange-500', textColor: 'text-orange-600' };
    if (product.stock <= 10) return { text: `Low Stock: ${product.stock}`, color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { text: 'In Stock', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="group relative">
      <Link
        to={`/product/${product.id}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-300"
      >
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
          {/* Image */}
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full capitalize shadow-sm">
              {product.category}
            </span>
          </div>

          {/* Stock Badge */}
          {product.stock <= 10 && product.stock > 0 && (
            <div className="absolute top-3 right-3">
              <div className={`${stockStatus.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                {stockStatus.text}
              </div>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                Out of Stock
              </div>
            </div>
          )}

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`absolute bottom-4 right-4 p-3 rounded-full shadow-xl transition-all duration-300 ${
              product.stock === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-110 hover:shadow-2xl'
            } opacity-0 group-hover:opacity-100`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          {/* Rating Stars */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-bold text-gray-700">{avgRating || 'New'}</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 h-14 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {/* Description Preview */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
            {product.description}
          </p>

          {/* Features Icons */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              <Leaf className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Eco</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">Safe</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Free Delivery</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-blue-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-700">
                  Rs{product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  per {product.unit || 'item'}
                </span>
              </div>
              <div className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Best Price
              </div>
            </div>

            {/* Add to Cart Button (Visible on mobile, hidden on desktop - replaced by floating button) */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`lg:hidden px-4 py-2.5 rounded-lg font-semibold transition-all ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add'}
            </button>
          </div>

          {/* Stock Status for Desktop */}
          {product.stock > 0 && (
            <div className="hidden lg:flex items-center justify-between mt-4 text-sm">
              <div className={`flex items-center gap-2 ${stockStatus.textColor}`}>
                <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
                {stockStatus.text}
              </div>
              {product.stock > 10 && (
                <span className="text-gray-500">✓ Available</span>
              )}
            </div>
          )}
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/30 rounded-2xl pointer-events-none transition-all duration-300" />
      </Link>

      {/* Desktop Add to Cart Button (Floating) */}
      <div className="hidden lg:block absolute bottom-24 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold shadow-2xl transition-all ${
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 hover:shadow-3xl'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}