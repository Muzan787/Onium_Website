import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sparkles, Phone, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null); // For PWA Install
  const totalItems = getTotalItems();

  useEffect(() => {
    if (totalItems > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Announcement Bar: More compact padding (py-1.5) */}
      <div className="bg-gradient-to-r from-primary-700 to-secondary-600 text-white text-xs md:text-sm py-1.5 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 animate-pulse text-accent-300" />
            <span className="font-medium">✨ Free Delivery on Orders Above Rs2,000</span>
          </div>
          <a href="https://wa.me/923231550147" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
            <Phone className="w-3 h-3" />
            <span className="text-xs font-medium">Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Header: Reduced padding (py-2) */}
      <header className="bg-gradient-to-r from-primary-600 to-secondary-500 md:bg-none md:bg-white sticky top-0 z-50 shadow-lg border-b border-white/10 md:border-primary-100 transition-all">
        <div className="container mx-auto px-4 py-2">
          <div className="relative flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Link 
                to="/" 
                className="flex-shrink-0 hover:opacity-90 transition-opacity absolute left-1/2 -translate-x-1/2 md:static md:transform-none"
              >
                {/* Compact Logo Size: 40px height */}
                <div className="relative" style={{ width: '120px', height: '40px' }}>
                  <div className="w-full h-full md:bg-gradient-to-r md:from-primary-600 md:to-secondary-500 p-1.5 rounded-lg flex items-center justify-center">
                    <img 
                      src="https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png" 
                      alt="Onium"
                      className="w-full h-full object-contain"
                      style={{ aspectRatio: '21/9' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) target.parentElement.innerHTML = `<span class="text-xl font-bold text-white tracking-tight">ONIUM</span>`;
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {['Home', 'Products', 'Reviews', 'About'].map((item) => {
                // Determine the correct link path
                const linkPath = item === 'Products' ? '/#products' : (item === 'Home' ? '/' : `/${item.toLowerCase()}`);
                
                return (
                  <a 
                    key={item}
                    href={linkPath} // Use standard href for hash links to work consistently
                    className="text-slate-600 hover:text-primary-600 font-semibold transition-colors relative group text-sm uppercase tracking-wide cursor-pointer"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden md:block relative">
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-64' : 'w-48'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search..."
                    className="w-full px-4 py-2 pl-10 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-800 placeholder-slate-400 text-sm transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </form>

              {/* Cart Icon - Slightly smaller padding */}
              <Link to="/cart" className="relative group">
                <div className={`p-2 bg-white/20 md:bg-primary-50 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105 ${animateCart ? 'scale-110 ring-2 ring-white/50 md:ring-primary-300' : ''}`}>
                  <ShoppingCart className={`w-5 h-5 md:w-6 md:h-6 text-white md:text-primary-600 ${animateCart ? 'animate-bounce' : ''}`} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center shadow-md border-2 border-transparent">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search: Tighter spacing (mt-2, py-2) */}
          <form onSubmit={handleSearch} className="mt-2 md:hidden w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 bg-white/95 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 text-slate-800 text-sm shadow-sm placeholder-slate-400"
                onFocus={() => setIsMenuOpen(false)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
            </div>
          </form>

          {/* Mobile Menu */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-3 pb-3 border-t border-white/20 pt-3`}>
            <div className="flex flex-col gap-2">
              {['Home', 'Products', 'Reviews', 'About'].map((item) => {
                const linkPath = item === 'Products' ? '/#products' : (item === 'Home' ? '/' : `/${item.toLowerCase()}`);
                
                return (
                  <a 
                    key={item}
                    href={linkPath}
                    className="py-2.5 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm text-sm block" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                );
              })}
              
              {/* Install App Button (Mobile Menu) */}
              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 py-2.5 px-4 bg-white text-primary-600 rounded-lg font-bold shadow-lg mt-1 justify-center active:scale-95 transition-transform text-sm w-full"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}