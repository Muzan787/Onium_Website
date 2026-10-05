import { useEffect, useState } from 'react';

/**
 * True once the site footer is within `earlyBy` pixels of the viewport. Pages
 * with a fixed bottom bar use it to slide the bar away before it can cover
 * the last of the page, and so the footer is never hidden behind it.
 */
export function useFooterInView(earlyBy = 120) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: `0px 0px ${earlyBy}px 0px`,
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [earlyBy]);

  return inView;
}
