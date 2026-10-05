import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks whether an element is on screen. Returns a callback ref, so it keeps
 * following the element even if it unmounts and comes back. A hidden
 * (display: none) element never counts as on screen.
 */
export function useInViewport<T extends Element>() {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) {
      setInView(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, inView] as const;
}
