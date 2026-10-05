import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  { label: 'Shop', to: '/', hash: '#products' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'About', to: '/about' },
  { label: 'Track order', to: '/track-order' },
];

const HELP = [
  { label: 'Contact', to: '/contact' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Shipping policy', to: '/shipping-policy' },
  { label: 'Returns & refunds', to: '/return-policy' },
];

export default function Header() {
  const { getTotalItems } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Leaving a page closes whatever was open on top of it.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Escape closes the sheet or the search panel, as it would a dialog.
  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsMenuOpen(false); setIsSearchOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen, isSearchOpen]);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') setDeferredPrompt(null);
    });
  };

  // Search used to post to /products, a route that doesn't exist, so it fell
  // through to the homepage and ignored the query. With a small range the
  // homepage filters its own list instead.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    navigate({ pathname: '/', search: `?q=${encodeURIComponent(q)}`, hash: '#products' });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (to: string) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <>
      {/* Logo blue: the wordmark is white on transparent, so on this field it
          reads exactly like its own lozenge on the bottles. On the homepage the
          category bar and hero continue the same blue with no seam. */}
      <header className="sticky top-0 z-50 bg-primary-600 shadow-[0_1px_0_0_#1757d1]">
        <div className="container mx-auto px-4">
          <div className="h-14 flex items-center justify-between gap-3">

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                className="md:hidden -ml-2.5 w-11 h-11 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" aria-hidden />
              </button>

              <Link to="/" aria-label="Onium home" className="flex items-center py-1.5">
                <img src={LOGO} alt="Onium" width={73} height={32} className="h-8 w-auto object-contain" />
              </Link>
            </div>

            <nav aria-label="Main" className="hidden md:flex items-stretch gap-7 self-stretch">
              {NAV.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.label}
                    to={{ pathname: item.to, hash: item.hash }}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center text-sm transition-colors ${
                      active ? 'text-white font-semibold' : 'text-white/80 font-medium hover:text-white'
                    }`}
                  >
                    {item.label}
                    {active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent-300" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center">
              <form role="search" onSubmit={handleSearch} className="hidden md:block relative mr-2">
                <input
                  type="search"
                  name="q"
                  autoComplete="off"
                  enterKeyHint="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label="Search products"
                  className="w-44 lg:w-56 pl-9 pr-3 py-2 text-sm text-ink bg-white rounded-full placeholder:text-ink/65"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/55" aria-hidden />
              </form>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search products"
                className="md:hidden w-11 h-11 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5" aria-hidden />
              </button>

              {user ? (
                <div className="hidden md:block relative group">
                  <button type="button" aria-label="Account" className="w-11 h-11 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors">
                    <User className="w-5 h-5" aria-hidden />
                  </button>
                  <div className="absolute right-0 top-full w-52 bg-white rounded-2xl shadow-xl border border-ink/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-[opacity,visibility] z-50 overflow-hidden">
                    <div className="p-3 border-b border-ink/5">
                      <p className="text-xs text-ink/65">Signed in as</p>
                      <p className="text-sm font-semibold truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-clay-700 hover:bg-clay-50 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" aria-hidden /> Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" aria-label="Log in" className="hidden md:grid w-11 h-11 place-items-center rounded-xl text-white hover:bg-white/10 transition-colors">
                  <LogIn className="w-5 h-5" aria-hidden />
                </Link>
              )}

              <Link
                to="/cart"
                aria-label={`Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
                className="relative w-11 h-11 -mr-2.5 md:mr-0 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <ShoppingCart className={`w-5 h-5 ${animateCart ? 'animate-bounce' : ''}`} aria-hidden />
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

      {/* Mobile search: drops down from the blue bar */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] md:hidden overscroll-contain" role="dialog" aria-modal="true" aria-label="Search products">
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
          <div className="relative bg-primary-600 px-4 py-3 shadow-xl">
            <form role="search" onSubmit={handleSearch} className="flex items-center gap-2">
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
                  className="w-full min-h-11 pl-10 pr-3 text-base text-ink bg-white rounded-full placeholder:text-ink/65"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/55" aria-hidden />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="min-h-11 px-2 text-sm font-semibold text-white"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu as a side sheet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative h-full w-[84%] max-w-xs bg-white flex flex-col shadow-2xl overscroll-contain">
            {/* Blue like the header — the white wordmark was invisible on the
                old white sheet. */}
            <div className="h-14 shrink-0 px-4 flex items-center justify-between bg-primary-600">
              <img src={LOGO} alt="Onium" width={73} height={32} className="h-8 w-auto object-contain" />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="-mr-2.5 w-11 h-11 grid place-items-center rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" aria-hidden />
              </button>
            </div>

            <nav aria-label="Menu" className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
              <ul>
                {NAV.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <li key={item.label}>
                      <Link
                        to={{ pathname: item.to, hash: item.hash }}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between min-h-12 px-3 -mx-3 rounded-xl text-xl font-display font-extrabold transition-colors ${
                          active ? 'text-primary-600' : 'text-ink hover:bg-surface'
                        }`}
                      >
                        {item.label}
                        {active && <span aria-hidden className="w-2 h-2 rounded-full bg-accent-500" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="my-4 h-px bg-ink/10" />

              <ul className="text-[15px]">
                {HELP.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center min-h-11 px-3 -mx-3 rounded-xl text-ink/75 hover:bg-surface transition-colors"
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-ink/10 space-y-2">
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full border border-ink/15 font-semibold text-sm text-ink"
                >
                  <Download className="w-4 h-4" aria-hidden /> Install app
                </button>
              )}
              {user ? (
                <>
                  <p className="text-xs text-ink/65 truncate px-1">{user.email}</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full bg-clay-50 text-clay-700 font-semibold text-sm"
                  >
                    <LogOut className="w-4 h-4" aria-hidden /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full min-h-11 flex items-center justify-center gap-2 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
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
