import { useEffect, useState } from 'react';
import { Sparkles, Filter, Shield, Truck, Leaf, Droplets, RefreshCw, MessageCircle, Star } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import DealSlider from '../components/DealSlider';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set(data?.map((p) => p.category) || [])
      );
      setCategories(['all', ...uniqueCategories]);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProducts();
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/923231550147?text=I%20want%20to%20purchase%20something..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-green-100 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-sm font-semibold text-green-700">Order on WhatsApp</span>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 animate-bounce hover:animate-none">
            <MessageCircle className="w-7 h-7" fill="white" />
          </div>
        </div>
      </a>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Sparkling Clean Homes
                <span className="block text-yellow-300">Made Simple</span>
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl mb-6">
                Premium detergents, cleaning supplies, and home hygiene products. 
                Get your home shining with our eco-friendly and effective solutions.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Leaf className="w-5 h-5 text-green-300" />
                  <span className="text-sm">Eco-Friendly</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Shield className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Hypoallergenic</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Truck className="w-5 h-5 text-blue-300" />
                  <span className="text-sm">Free Delivery</span>
                </div>
              </div>
              
              {/* Customer Rating */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-blue-200">4.8/5 based on 1,200+ reviews</span>
              </div>
            </div>
            <div className="hidden lg:block flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              <div className="relative">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-white/20 to-transparent rounded-full flex items-center justify-center">
                  <Droplets className="w-48 h-48 text-white/30" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/90">Fresh & Clean</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Slider */}
      <div className="container mx-auto px-4 -mt-2 md:-mt-5 relative z-10">
        <div className="relative">
          <DealSlider />
          <div className="absolute -top-3 left-6 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">HOT DEALS</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Products Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                  <Filter className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                  Our Cleaning Products
                </h2>
              </div>
              <p className="text-slate-600 max-w-2xl">
                Browse our wide range of detergents, cleaning agents, and home hygiene products for a spotless home.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all disabled:opacity-50 border border-blue-200 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-blue-700">Refresh</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Filter by Category</h3>
              <span className="text-sm text-slate-500 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 rounded-full border border-blue-200">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </span>
            </div>
            
            <div className="relative">
              <div className="hidden sm:block absolute -left-4 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-50 to-transparent pointer-events-none z-10" />
              <div className="hidden sm:block absolute -right-4 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none z-10" />
              
              <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group flex items-center gap-2 px-5 py-3 rounded-xl transition-all whitespace-nowrap border-2 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-lg scale-105'
                        : 'bg-white text-slate-700 hover:bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">
                      {category === 'all' ? 'All Products' : category}
                    </span>
                    {selectedCategory === category && (
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-blue-200 rounded w-1/3" />
                  <div className="h-5 bg-blue-200 rounded w-2/3" />
                  <div className="h-8 bg-blue-200 rounded w-1/2" />
                  <div className="h-10 bg-blue-200 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-b from-white to-blue-50 rounded-2xl border-2 border-dashed border-blue-300">
            <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
              <Filter className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-blue-700 mb-3">
              No Products Found
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find any products in the "{selectedCategory}" category.
              Try selecting a different category or check back later for new arrivals.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg transition-all hover:scale-105 shadow-md"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200 shadow-sm">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
              Why Choose Our Cleaning Products?
            </h3>
            <p className="text-blue-700 max-w-3xl mx-auto">
              We're committed to providing the best cleaning solutions for your home
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="inline-flex p-3 bg-green-100 rounded-lg mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-blue-900 text-lg mb-2">Eco-Friendly Formulas</h4>
              <p className="text-slate-600 text-sm">
                Biodegradable ingredients that are safe for your family and the environment.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="inline-flex p-3 bg-yellow-100 rounded-lg mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-bold text-blue-900 text-lg mb-2">Safe & Gentle</h4>
              <p className="text-slate-600 text-sm">
                Hypoallergenic and dermatologically tested for sensitive skin.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="inline-flex p-3 bg-blue-100 rounded-lg mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-blue-900 text-lg mb-2">Fast Delivery</h4>
              <p className="text-slate-600 text-sm">
                Free same-day delivery on orders above ₹500. Quick and reliable service.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Need Bulk Order for Business?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Contact us for wholesale pricing, custom packaging, and commercial cleaning solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/923231550147?text=I'm%20interested%20in%20bulk%20order%20for%20business..."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 hover:shadow-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp for Bulk Order
            </a>
            <a
              href="tel:+923231550147"
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 hover:shadow-xl transition-all shadow-md"
            >
              Call Us: +92 323 1550147
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this to your global CSS or inline styles
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .animate-bounce {
    animation: bounce 2s infinite;
  }
`;