import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sparkles, Phone, Download, User, LogOut, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useState, useEffect } from 'react';

export default function Header() {
  const { getTotalItems } = useCart();
  const { user, signOut } = useAuth(); // Use Auth Context
  const navigate = useNavigate();
  
  // ... (keep existing state: searchQuery, isMenuOpen, etc.) ...
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const totalItems = getTotalItems();

  // ... (keep existing useEffects) ...
  useEffect(() => {
    if (totalItems > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') setDeferredPrompt(null);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
  };

  // --- NEW: Logout Handler ---
  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <>
      {/* ... (Keep Announcement Bar as is) ... */}
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

      <header className="bg-gradient-to-r from-primary-600 to-secondary-500 md:bg-none md:bg-white sticky top-0 z-50 shadow-lg border-b border-white/10 md:border-primary-100 transition-all">
        <div className="container mx-auto px-4 py-2">
          <div className="relative flex items-center justify-between gap-4">
            
            {/* ... (Keep Mobile Menu Button & Logo) ... */}
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity absolute left-1/2 -translate-x-1/2 md:static md:transform-none">
                <div className="relative" style={{ width: '120px', height: '40px' }}>
                  <div className="w-full h-full md:bg-gradient-to-r md:from-primary-600 md:to-secondary-500 p-1.5 rounded-lg flex items-center justify-center">
                    <img 
                      src="https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png" 
                      alt="Onium"
                      className="w-full h-full object-contain"
                      style={{ aspectRatio: '21/9' }} 
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {['Home', 'Products', 'Reviews', 'About'].map((item) => {
                const linkPath = item === 'Products' ? '/#products' : (item === 'Home' ? '/' : `/${item.toLowerCase()}`);
                return (
                  <a key={item} href={linkPath} className="text-slate-600 hover:text-primary-600 font-semibold transition-colors relative group text-sm uppercase tracking-wide cursor-pointer">
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {/* ... (Keep Search Form) ... */}
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

              {/* --- NEW: User Icon (Desktop) --- */}
              <div className="hidden md:block relative group">
                {user ? (
                  <button className="p-2 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                    <User className="w-6 h-6 text-primary-600" />
                  </button>
                ) : (
                  <Link to="/login" className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors block">
                    <LogIn className="w-6 h-6 text-slate-600" />
                  </Link>
                )}
                
                {/* Dropdown for Logged In User */}
                {user && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                    <div className="p-3 border-b border-slate-50">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 rounded-b-xl"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
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

          {/* ... (Keep Mobile Search) ... */}
          <form onSubmit={handleSearch} className="mt-2 md:hidden w-full">
            {/* ... search input ... */}
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
              {/* --- NEW: Mobile Login/Logout --- */}
              {user ? (
                <div className="bg-white/10 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-3 mb-2 text-white">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium truncate">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-500/80 hover:bg-red-500 text-white rounded text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 px-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-primary-50 transition-colors text-sm flex items-center gap-2 mb-2"
                >
                  <LogIn className="w-4 h-4" /> Login / Sign Up
                </Link>
              )}

              {/* Existing Links */}
              {['Home', 'Products', 'Reviews', 'About'].map((item) => {
                const linkPath = item === 'Products' ? '/#products' : (item === 'Home' ? '/' : `/${item.toLowerCase()}`);
                return (
                  <a key={item} href={linkPath} className="py-2.5 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm text-sm block" onClick={() => setIsMenuOpen(false)}>
                    {item}
                  </a>
                );
              })}
              
              {/* Install Button */}
              {deferredPrompt && (
                <button onClick={handleInstallClick} className="flex items-center gap-2 py-2.5 px-4 bg-white text-primary-600 rounded-lg font-bold shadow-lg mt-1 justify-center active:scale-95 transition-transform text-sm w-full">
                  <Download className="w-4 h-4" /> Install App
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}