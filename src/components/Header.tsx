import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Download, User, LogOut, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const LOGO = 'https://res.cloudinary.com/dztldh7o2/image/upload/v1769171993/Logo_ft1lsj.png';

/** Chromium-only, so it isn't in lib.dom. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const NAV = [
  { label: 'Shop', href: '/#products' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'About', href: '/about' },
  { label: 'Track order', href: '/track-order' },
];

export default function Header() {
  const { getTotalItems } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const totalItems = getTotalItems();

  useEffect(() => {
    if (totalItems > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // The sheet and the search panel both cover the page; don't let the page
  // scroll underneath them.
  useEffect(() => {
    const locked = isMenuOpen || isSearchOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isSearchOpen]);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') setDeferredPrompt(null);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* A single ink bar. The Onium wordmark is white on transparent, so it
          needs a dark field to read — and the announcement line it used to sit
          under just repeated what the hero already says. */}
      <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="h-14 flex items-center justify-between gap-3">

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                className="md:hidden -ml-2.5 w-11 h-11 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" aria-hidden />
              </button>

              <Link to="/" aria-label="Onium home" className="flex items-center py-1.5">
                <img src={LOGO} alt="Onium" width={73} height={32} className="h-8 w-auto object-contain" />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-7">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <form onSubmit={handleSearch} className="hidden md:block relative mr-1">
                <input
                  type="search"
                  name="q"
                  autoComplete="off"
                  enterKeyHint="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label="Search products"
                  className="w-44 lg:w-56 pl-9 pr-3 py-2 text-sm text-white bg-white/10 border border-transparent rounded-full placeholder-white/45 focus:bg-white/15 focus:border-white/25 transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" aria-hidden />
              </form>

              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search products"
                className="md:hidden w-11 h-11 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5" aria-hidden />
              </button>

              {user ? (
                <div className="hidden md:block relative group">
                  <button aria-label="Account" className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors">
                    <User className="w-5 h-5" aria-hidden />
                  </button>
                  <div className="absolute right-0 top-full w-52 bg-white rounded-2xl shadow-xl border border-ink/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-[opacity,visibility] z-50 overflow-hidden">
                    <div className="p-3 border-b border-ink/5">
                      <p className="text-xs text-ink/50">Signed in as</p>
                      <p className="text-sm font-semibold truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-clay-700 hover:bg-clay-50 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" aria-hidden /> Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" aria-label="Log in" className="hidden md:block p-2 rounded-xl text-white hover:bg-white/10 transition-colors">
                  <LogIn className="w-5 h-5" aria-hidden />
                </Link>
              )}

              <Link to="/cart" aria-label={`Cart, ${totalItems} items`} className="relative w-11 h-11 -mr-2.5 md:mr-0 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors">
                <ShoppingCart className={`w-5 h-5 ${animateCart ? 'animate-bounce' : ''}`} />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-accent-500 text-ink text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center tabular">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search, opened on demand instead of permanently taking a row */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] md:hidden overscroll-contain">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
          <div className="relative bg-white p-4 shadow-xl">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  autoFocus
                  type="search"
                  name="q"
                  autoComplete="off"
                  enterKeyHint="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="w-full pl-10 pr-3 py-3 text-base bg-surface border border-ink/10 rounded-xl placeholder-ink/40"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" aria-hidden />
              </div>
              <button type="button" onClick={() => setIsSearchOpen(false)} className="px-3 py-3 text-sm font-semibold text-ink/60">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu as a side sheet rather than pushing the page down */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative h-full w-[82%] max-w-xs bg-white flex flex-col shadow-2xl overscroll-contain">
            <div className="h-14 px-4 flex items-center justify-between border-b border-ink/10">
              <img src={LOGO} alt="Onium" width={73} height={32} className="h-8 w-auto object-contain" />
              <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="p-2 -mr-2 rounded-xl hover:bg-ink/5">
                <X className="w-6 h-6" aria-hidden />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain p-4">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-3 px-3 -mx-3 rounded-xl text-lg font-display font-bold text-ink hover:bg-surface transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="my-5 h-px bg-ink/10" />

              <ul className="space-y-1 text-sm">
                {[
                  { label: 'Contact', href: '/contact' },
                  { label: 'FAQs', href: '/faq' },
                  { label: 'Shipping policy', href: '/shipping-policy' },
                  { label: 'Returns & refunds', href: '/return-policy' },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2.5 px-3 -mx-3 rounded-xl text-ink/70 hover:bg-surface transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-ink/10 space-y-2">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-ink/15 font-semibold text-sm text-ink"
                >
                  <Download className="w-4 h-4" aria-hidden /> Install app
                </button>
              )}
              {user ? (
                <>
                  <p className="text-xs text-ink/50 truncate px-1">{user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-clay-50 text-clay-700 font-semibold text-sm"
                  >
                    <LogOut className="w-4 h-4" aria-hidden /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm"
                >
                  <LogIn className="w-4 h-4" aria-hidden /> Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
