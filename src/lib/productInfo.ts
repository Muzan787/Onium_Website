import { Product } from './supabase';
import { splitTitle } from './format';

/** "500ml", "1L", "1kg" and friends, as they appear in product titles. */
const SIZE = /\(?\b(\d+(?:\.\d+)?\s?(?:ml|l|ltr|litre|liter|kg|g))\b\)?/i;

/**
 * Product titles carry a name, a strapline and a pack size in one string
 * ("Onium Glass Cleaner Power Spray – Streak-Free Shine (500ml)"). The page
 * sets each in its own voice, so pull them apart.
 */
export function describeTitle(product: Pick<Product, 'title' | 'specifications'>) {
  const { name, detail } = splitTitle(product.title);
  const inTitle = product.title.match(SIZE)?.[1];

  const specSize = Object.entries(product.specifications ?? {}).find(([key]) =>
    /^(volume|weight|size)\b/i.test(key.trim()),
  )?.[1];

  return {
    name: name.replace(SIZE, '').trim() || name,
    strapline: detail.replace(SIZE, '').replace(/[\s–—-]+$/, '').trim(),
    size: inTitle?.replace(/\s+/g, '') ?? (specSize ? String(specSize).trim() : null),
  };
}

export interface SpecRow {
  label: string;
  value: string;
}

/**
 * Specifications are typed in by hand in the admin panel, so keys arrive as
 * "Volume", "volume", "Weight:" or "key_features". Normalise the labels, and
 * lift the comma-separated "key features" out into their own list.
 */
export function readSpecs(specs: Product['specifications']) {
  const features: string[] = [];
  const rows: SpecRow[] = [];

  for (const [rawKey, rawValue] of Object.entries(specs ?? {})) {
    const key = rawKey.replace(/[:_]+/g, ' ').replace(/\s+/g, ' ').trim();
    const value = String(rawValue ?? '').trim();
    if (!key || !value) continue;

    if (/^key features?$/i.test(key)) {
      features.push(...value.split(',').map((item) => item.trim()).filter(Boolean));
    } else {
      rows.push({ label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(), value });
    }
  }

  return { features, rows };
}

/**
 * The admin editor joins every word with a non-breaking space, which turns
 * each paragraph into one unbreakable line. Give the words their spaces back.
 */
export function cleanDescription(html: string | null | undefined) {
  return (html ?? '').replace(/&nbsp;|\u00a0/g, ' ').replace(/<p>\s*<\/p>/g, '').trim();
}

/** The description as plain text, for meta tags. */
export function plainDescription(html: string | null | undefined) {
  const text = new DOMParser().parseFromString(cleanDescription(html), 'text/html').body.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim();
}

export const finalPriceOf = (product: Pick<Product, 'price' | 'discount'>) =>
  (product.discount ?? 0) > 0 ? product.price * (1 - (product.discount ?? 0) / 100) : product.price;
