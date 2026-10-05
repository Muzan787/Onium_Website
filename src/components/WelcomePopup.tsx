import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, X } from 'lucide-react';

const SEEN_KEY = 'onium_welcome_seen';
const CODE = 'WELCOME10';
// Places where a promotion would only get in the way.
const QUIET_PATHS = ['/checkout', '/login', '/forgot-password', '/update-password'];

function hasSeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === 'true';
  } catch {
    return true;
  }
}

/** First-visit offer for the WELCOME10 code. Shown once per browser session. */
export default function WelcomePopup() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (hasSeen() || QUIET_PATHS.includes(pathname)) return;
    const timer = window.setTimeout(() => setIsOpen(true), 2000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const close = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, 'true');
    } catch {
      // Private browsing: it may show again next visit, which is fine.
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    primaryRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      returnFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the code is on screen to type.
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-ink/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            aria-describedby="welcome-body"
            className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative bg-primary-600 text-white px-6 pt-8 pb-7">
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute top-3 right-3 w-11 h-11 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <h2 id="welcome-title" className="pr-10 font-extrabold text-[40px] leading-[0.95]">
                10% off your first order
              </h2>
            </div>

            <div className="px-6 pt-6 pb-6">
              <p id="welcome-body" className="text-[16px] text-ink/75 leading-relaxed">
                Use this code at checkout. It works once per account, so log in or create one first.
              </p>
              <button
                type="button"
                onClick={copyCode}
                className="mt-5 w-full flex items-center justify-between gap-3 min-h-[56px] px-5 rounded-2xl border-2 border-dashed border-primary-600/40 hover:border-primary-600 transition-colors"
              >
                <span className="font-display font-extrabold text-ink text-2xl tracking-wide">{CODE}</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                  {copied ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                  <span aria-live="polite">{copied ? 'Copied' : 'Copy code'}</span>
                </span>
              </button>
              <div className="mt-6 grid gap-2">
                <Link
                  ref={primaryRef}
                  to="/login"
                  state={{ signUp: true }}
                  onClick={close}
                  className="inline-flex items-center justify-center min-h-[52px] rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                >
                  Create an account
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="min-h-12 rounded-full text-ink font-semibold hover:bg-surface transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
