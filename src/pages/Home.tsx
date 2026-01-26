import { useEffect, useState } from 'react';
import { 
  Sparkles, Filter, Shield, Truck, Leaf, Droplets, RefreshCw, MessageCircle, Star, 
  Headphones, Watch, Camera, LayoutGrid, Package, ArrowUpDown, ChevronDown, X 
} from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

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

      setProducts(data || []);
      const uniqueCategories = Array.from(new Set((data || []).map(p => p.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title="Home" description="Premium eco-friendly cleaning solutions for a safer, sparklier home." />

      {/* HERO SECTION UPDATED:
        - Reduced pt-32 to pt-24 (mobile) and lg:pt-32 (desktop)
        - Reduced pb-20 to pb-12 (mobile)
      */}
      <div className="relative bg-slate-900 pt-12 pb-12 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl mix-blend-screen animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold mb-4 border border-white/10 backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>Premium Cleaning Solutions</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight animate-slide-up">
            Make Your Home <br className="md:hidden"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400">Sparkle & Shine</span>
          </h1>
          
          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto mb-6 leading-relaxed animate-slide-up-delay">
            Powerful, eco-friendly formulas designed to tackle the toughest stains while keeping your family safe.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-xs md:text-sm font-medium text-slate-300 animate-slide-up-delay-2">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Shield className="w-4 h-4 text-primary-400" /> Safe for Kids</div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Leaf className="w-4 h-4 text-green-400" /> Eco-Friendly</div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><RefreshCw className="w-4 h-4 text-blue-400" /> Fast Acting</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div id="products" className="container mx-auto px-4 -mt-6 relative z-20 scroll-mt-24">
        
        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-yellow-50 rounded-lg"><Star className="w-5 h-5 text-yellow-500 fill-current" /></div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-slate-900 text-lg">{stats.average}</span>
                <span className="text-slate-500 text-xs">/ 5.0</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Based on {stats.total} reviews</p>
            </div>
          </div>
          
          <div className="h-px w-full md:w-px md:h-10 bg-slate-100"></div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-green-50 rounded-lg"><Truck className="w-5 h-5 text-green-500" /></div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Free Shipping</p>
              <p className="text-xs text-slate-500">On orders over Rs2000</p>
            </div>
          </div>

          <div className="h-px w-full md:w-px md:h-10 bg-slate-100"></div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-blue-50 rounded-lg"><Shield className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="font-bold text-slate-900 text-sm">100% Secure</p>
              <p className="text-xs text-slate-500">Cash on Delivery Available</p>
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm p-2 -mx-2 rounded-xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap capitalize transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-48 appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm hover:border-primary-300 transition-colors"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border border-slate-200 transition-all ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white text-slate-600 hover:border-primary-300'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-80 animate-pulse">
                <div className="w-full h-40 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {getFilteredProducts().map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {getFilteredProducts().length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                <p className="text-slate-500 mt-2">Try changing your category or filters.</p>
                <button onClick={() => {setSelectedCategory('all'); setSortBy('newest');}} className="mt-4 text-primary-600 font-bold hover:underline">Clear Filters</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/923231550147?text=Hi%2C%20I%20want%20to%20order..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
      
      {/* Bottom CTA for Bulk Orders */}
      <div className="bg-slate-900 py-12 md:py-16 mt-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
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
            </div>
          </div>
      </div>
    </div>
  );
}