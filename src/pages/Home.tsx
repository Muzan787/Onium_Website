import { useEffect, useState } from 'react';
import { 
  Sparkles, Filter, Shield, Truck, Leaf, Droplets, RefreshCw, MessageCircle, Star, 
  Headphones, Watch, Camera, LayoutGrid, Package, ArrowUpDown, ChevronDown, X 
} from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO'; // NEW

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Mobile toggle

  const [stats, setStats] = useState({ average: 0, total: 0 });

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
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const uniqueCategories = Array.from(new Set(data?.map((p) => p.category) || []));
      setCategories(['all', ...uniqueCategories]);
      setProducts(data || []);
    } catch (error) { console.error('Error:', error); } 
    finally { setIsLoading(false); setIsRefreshing(false); }
  };

  const handleRefresh = () => { setIsRefreshing(true); fetchProducts(); };

  // --- Filtering & Sorting Logic ---
  const filteredProducts = products
    .filter((p) => {
      // Category Filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      // Price Filter
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort Logic
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': 
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'all': return <LayoutGrid className="w-6 h-6" />;
      case 'audio': return <Headphones className="w-6 h-6" />;
      case 'wearables': return <Watch className="w-6 h-6" />;
      case 'cameras': return <Camera className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NEW: SEO Component */}
      <SEO title="Home" description="Premium cleaning products for a sparkling home. Shop eco-friendly detergents and tools." />
      {/* Floating WhatsApp */}
      <a href="https://wa.me/923231550147?text=Hi%2C%20I%20want%20to%20order..." target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 group">
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-primary-100 opacity-0 group-hover:opacity-100 transition-all">
            <span className="text-sm font-bold text-primary-700">Order on WhatsApp</span>
          </div>
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all animate-bounce hover:animate-none">
            <MessageCircle className="w-7 h-7" fill="white" />
          </div>
        </div>
      </a>

      {/* Hero Section: New Brand Gradient */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 text-sm font-medium text-primary-100">
                🚀 Premium Quality Guaranteed
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                Fresh & Clean <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">Living Starts Here</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-xl mb-8 leading-relaxed">
                Discover our range of eco-friendly detergents and home hygiene products. Tough on stains, gentle on the planet.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                  <Leaf className="w-5 h-5 text-primary-400" /> <span className="font-medium">Eco-Friendly</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                  <Shield className="w-5 h-5 text-secondary-400" /> <span className="font-medium">Safe & Tested</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex flex-1 justify-center relative">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <div className="relative z-10 w-full h-full bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                  <Droplets className="w-40 h-40 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        
        {/* --- Category Tabs --- */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Explore Categories</h2>
            <button onClick={handleRefresh} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <RefreshCw className={`w-5 h-5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`group flex flex-col items-center justify-center gap-3 px-6 py-5 rounded-2xl transition-all border-2 min-w-[110px] ${
                  selectedCategory === category
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-primary-200 hover:shadow-md'
                }`}
              >
                <div className={`p-2.5 rounded-full ${selectedCategory === category ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-primary-50 text-slate-400 group-hover:text-primary-600'}`}>
                  {getCategoryIcon(category)}
                </div>
                <span className="text-sm font-bold capitalize">{category === 'all' ? 'All' : category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Filter & Sort Toolbar --- */}
        <div className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm py-2 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            
            {/* Left: Result Count & Filter Toggle */}
            <div className="flex items-center justify-between md:justify-start gap-4">
              <span className="text-sm font-medium text-slate-500">
                {filteredProducts.length} Results
              </span>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors md:hidden ${showFilters ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-700'}`}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>

            {/* Right: Filters & Sort (Hidden on mobile unless toggled) */}
            <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100`}>
              
              {/* Price Inputs */}
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full md:w-48 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Clear Button */}
              {(minPrice || maxPrice || selectedCategory !== 'all' || sortBy !== 'newest') && (
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- Product Grid --- */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
            <p className="text-slate-500">Try adjusting your price range or category.</p>
            <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800">
              Clear Filters
            </button>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Why Choose Onium?
            </h3>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We're committed to providing the best cleaning solutions for your home
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-primary-50 border border-primary-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="inline-flex p-3 bg-primary-100 rounded-xl mb-4">
                <Leaf className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Eco-Friendly</h4>
              <p className="text-slate-600 text-sm">
                Biodegradable ingredients that are safe for your family and the environment.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-secondary-50 border border-secondary-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="inline-flex p-3 bg-secondary-100 rounded-xl mb-4">
                <Shield className="w-8 h-8 text-secondary-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Safe & Gentle</h4>
              <p className="text-slate-600 text-sm">
                Hypoallergenic and dermatologically tested for sensitive skin.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-accent-50 border border-accent-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="inline-flex p-3 bg-accent-100 rounded-xl mb-4">
                <Truck className="w-8 h-8 text-accent-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Fast Delivery</h4>
              <p className="text-slate-600 text-sm">
                Free same-day delivery on orders above Rs2,000. Quick and reliable service.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Need Bulk Order for Business?
            </h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Contact us for wholesale pricing, custom packaging, and commercial cleaning solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/923231550147?text=I'm%20interested%20in%20bulk%20order%20for%20business..."
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-900/20 transition-all inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp for Bulk Order
              </a>
              <a
                href="tel:+923231550147"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Call Us: +92 323 1550147
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}