import type { MouseEvent } from 'react';

/**
 * Tapping a product photo grows it into the product page's photo, so the
 * bottle you picked stays in your hand while the page changes around it.
 *
 * Built on the View Transitions API. Browsers without it, and anyone who has
 * asked for reduced motion, simply navigate as normal.
 *
 * React Router renders route changes inside React.startTransition, so the new
 * page cannot be flushed synchronously inside startViewTransition's callback.
 * The callback instead waits for the product page to report that its photo is
 * on screen (`markArrived`), with a timeout so a slow page can never leave the
 * old snapshot frozen on screen.
 */

export const PHOTO_TRANSITION = 'product-photo';

let arrive: (() => void) | null = null;

/** Called by the product page once its photo is in the DOM and decoded. */
export function markArrived() {
  arrive?.();
  arrive = null;
}

/** Plain left clicks only; new-tab clicks and modified clicks keep their meaning. */
export function canMorph(event: MouseEvent) {
  return (
    typeof document.startViewTransition === 'function' &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * The product page's photo always carries the transition name, so while a
 * card on that same page is taking off (the "more from the range" strip) the
 * page's own photo has to give the name up, or the browser sees two elements
 * with one name and skips the transition entirely.
 */
export function morphFrom(photo: HTMLElement, go: () => void) {
  const root = document.documentElement;
  photo.style.viewTransitionName = PHOTO_TRANSITION;
  root.dataset.morph = 'leaving';

  document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        photo.style.viewTransitionName = '';
        delete root.dataset.morph;
        arrive = resolve;
        window.setTimeout(resolve, 700);
        go();
      }),
  );
}
