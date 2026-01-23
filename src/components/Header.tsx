import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sparkles, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Header() {
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>✨ Free Delivery on Orders Above ₹500</span>
          </div>
          <a 
            href="https://wa.me/923231550147" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span className="text-xs font-medium">Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white sticky top-0 z-50 shadow-lg border-b border-blue-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Logo & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-blue-700" />
                ) : (
                  <Menu className="w-6 h-6 text-blue-700" />
                )}
              </button>

              {/* Logo with 21:9 Aspect Ratio */}
              <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
                <div className="relative" style={{ width: '140px', height: '60px' }}>
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg flex items-center justify-center">
                    <img 
                      src="https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png" 
                      alt="Onium Logo"
                      className="w-full h-full object-contain"
                      style={{ aspectRatio: '21/9' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <span class="text-lg font-bold text-white tracking-wider">
                              ONIUM
                            </span>
                          `;
                        }
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/reviews" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Reviews
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <a 
                href="https://wa.me/923231550147" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-1.831 0-3.505-.655-4.812-1.741l-4.812 1.741 1.321-4.631c-1.102-1.904-1.74-4.076-1.74-6.399 0-6.214 5.058-11.272 11.272-11.272 3.014 0 5.847 1.174 7.977 3.304 2.13 2.131 3.304 4.964 3.304 7.977 0 6.214-5.058 11.272-11.272 11.272"/>
                </svg>
                WhatsApp
              </a>
            </nav>

            {/* Right: Search & Cart */}
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
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                    >
                      Search
                    </button>
                  )}
                </div>
              </form>

              {/* Mobile Search Toggle */}
              <button 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {showMobileSearch ? (
                  <X className="w-6 h-6 text-blue-700" />
                ) : (
                  <Search className="w-6 h-6 text-blue-700" />
                )}
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative group">
                <div className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-10 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  View Cart
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <form 
            onSubmit={handleSearch} 
            className={`mt-4 md:hidden transition-all duration-300 ${
              showMobileSearch ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search detergents, cleaners..."
                className="w-full px-4 py-3 pl-12 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                onFocus={() => setIsMenuOpen(false)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-lg text-sm font-semibold"
                >
                  Go
                </button>
              )}
            </div>
          </form>

          {/* Mobile Menu */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4 pb-4 border-t border-blue-100 pt-4`}>
            <div className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="py-2.5 px-4 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="py-2.5 px-4 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              <Link 
                to="/reviews" 
                className="py-2.5 px-4 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Customer Reviews
              </Link>
              <Link 
                to="/about" 
                className="py-2.5 px-4 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <a 
                href="https://wa.me/923231550147" 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-1.831 0-3.505-.655-4.812-1.741l-4.812 1.741 1.321-4.631c-1.102-1.904-1.74-4.076-1.74-6.399 0-6.214 5.058-11.272 11.272-11.272 3.014 0 5.847 1.174 7.977 3.304 2.13 2.131 3.304 4.964 3.304 7.977 0 6.214-5.058 11.272-11.272 11.272"/>
                </svg>
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}