import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sparkles, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // State for cart animation
  const [animateCart, setAnimateCart] = useState(false);
  const totalItems = getTotalItems();

  // Trigger animation when items change
  useEffect(() => {
    if (totalItems > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>✨ Free Delivery on Orders Above Rs2,000</span>
          </div>
          <a href="https://wa.me/923231550147" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
            <Phone className="w-3 h-3" />
            <span className="text-xs font-medium">Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* HEADER: Gradient on mobile, White on Desktop */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 md:bg-none md:bg-white sticky top-0 z-50 shadow-lg border-b border-blue-100/20 md:border-blue-100">
        <div className="container mx-auto px-4 py-3">
          <div className="relative flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              {/* Menu Button: White on mobile, Blue on desktop */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors">
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
              
              {/* Logo: Centered on mobile */}
              <Link 
                to="/" 
                className="flex-shrink-0 hover:opacity-90 transition-opacity absolute left-1/2 -translate-x-1/2 md:static md:transform-none"
              >
                <div className="relative" style={{ width: '140px', height: '60px' }}>
                  {/* Logo Container: Transparent on mobile (blends with header), Gradient on desktop */}
                  <div className="w-full h-full md:bg-gradient-to-r md:from-blue-600 md:to-cyan-500 p-2 rounded-lg flex items-center justify-center">
                    <img 
                      src="https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png" 
                      alt="Onium Logo"
                      className="w-full h-full object-contain"
                      style={{ aspectRatio: '21/9' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<span class="text-lg font-bold text-white tracking-wider">ONIUM</span>`;
                        }
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Nav (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/reviews" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Reviews
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden md:block relative">
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-72' : 'w-56'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search cleaning products..."
                    className="w-full px-4 py-2.5 pl-11 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-blue-400 transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  {searchQuery && (
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:shadow-lg transition-all">Search</button>
                  )}
                </div>
              </form>

              {/* Cart Icon: Transparent/White on mobile, Gradient on desktop */}
              <Link to="/cart" className="relative group">
                <div className={`p-2.5 bg-white/20 md:bg-gradient-to-br md:from-blue-50 md:to-cyan-50 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105 ${animateCart ? 'scale-110 ring-2 ring-white/50 md:ring-blue-300' : ''}`}>
                  <ShoppingCart className={`w-6 h-6 text-white md:text-blue-600 ${animateCart ? 'animate-bounce' : ''}`} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg border-2 border-transparent">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search: Clean white background on blue header */}
          <form onSubmit={handleSearch} className="mt-3 md:hidden w-full pb-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search detergents, cleaners..."
                className="w-full px-4 py-3 pl-12 bg-white/95 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 shadow-sm placeholder-gray-400"
                onFocus={() => setIsMenuOpen(false)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
              {searchQuery && (
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-semibold">Go</button>
              )}
            </div>
          </form>

          {/* Mobile Menu Dropdown */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4 pb-4 border-t border-white/20 pt-4`}>
            <div className="flex flex-col gap-3">
              <Link to="/" className="py-2.5 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/products" className="py-2.5 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>All Products</Link>
              <Link to="/reviews" className="py-2.5 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>Reviews</Link>
              <Link to="/about" className="py-2.5 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>About Us</Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}