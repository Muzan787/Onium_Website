import { Link } from 'react-router-dom';
import { ShoppingCart, Search} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Header() {
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-slate-950 text-white sticky top-0 z-50 shadow-xl border-b border-slate-800">
      <div className="container mx-auto px-4 py-3 md:py-5">
        <div className="flex flex-col gap-4 md:gap-6">
          
          {/* Main Header Row */}
          <div className="flex items-center justify-between gap-4 md:gap-10">
            
            {/* 1. Logo */}
            <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
              <div className="relative w-24 h-8 md:w-32 md:h-10">
                <img 
                  src="https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png" 
                  alt="Onium Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<span class="text-xl md:text-2xl font-bold tracking-wider">ONIUM</span>';
                  }}
                />
              </div>
            </Link>

            {/* 2. Desktop Search (Hidden on Mobile) */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-3xl">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, or categories..."
                  className="w-full px-4 py-2.5 pl-12 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-500" />
                </div>
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 px-5 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>

            {/* 3. Action Icons */}
            <div className="flex items-center gap-3 md:gap-6">
              <Link to="/cart" className="relative p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

            </div>
          </div>

          {/* 4. Mobile Search (Hidden on Desktop) */}
          <form onSubmit={handleSearch} className="md:hidden w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 pl-12 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none text-white text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </form>

          {/* 5. Navigation Bar (As shown in your image) */}
          <nav className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto no-scrollbar py-1 border-t border-slate-800/50 pt-3">
            <Link to="/products" className="whitespace-nowrap text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors">
              All Products
            </Link>
            <Link to="/products?category=networking" className="whitespace-nowrap text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Networking
            </Link>
            <Link to="/products?category=servers" className="whitespace-nowrap text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Servers
            </Link>
            <Link to="/products?category=security" className="whitespace-nowrap text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Security
            </Link>
            <Link to="/support" className="whitespace-nowrap text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Support
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
}