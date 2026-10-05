/**
 * Every Onium product is already colour-coded by the liquid inside the bottle,
 * and the photography leans into it — the dish wash is shot in golden kitchen
 * light, the glass cleaner in cool cyan. These accents are sampled from those
 * photographs so the page takes its colour from the actual range rather than
 * from an invented palette.
 */

export type AccentName = 'gold' | 'clay' | 'cyan' | 'blue' | 'teal';

export interface Accent {
  name: AccentName;
  /** The saturated hue, for rules, badges and the scroll colour field. */
  solid: string;
  /** A light wash of the same hue, sitting behind the product photo. */
  tint: string;
  /** Readable text on `tint`. */
  deep: string;
}

export const ACCENTS: Record<AccentName, Accent> = {
  gold: { name: 'gold', solid: '#e09400', tint: '#fff6e2', deep: '#7b450c' },
  clay: { name: 'clay', solid: '#b03a33', tint: '#fbeae7', deep: '#772f27' },
  cyan: { name: 'cyan', solid: '#03a0d2', tint: '#e3f6fd', deep: '#0a7ba6' },
  blue: { name: 'blue', solid: '#1757d1', tint: '#e8f0fe', deep: '#1b3f92' },
  teal: { name: 'teal', solid: '#0e7490', tint: '#e2f4f7', deep: '#115e6b' },
};

/** Sampled per product, because two floor cleaners can be different colours. */
const BY_SLUG: Record<string, AccentName> = {
  'dish-wash': 'gold',
  'phenyl-power-clean-pine-fragrance-1l-': 'gold',
  'onium-sweep-cleaner-multi-surface-stain-remover-500ml-': 'clay',
  'onium-glass-cleaner-power-spray-streak-free-shine-500ml-': 'cyan',
  'onium-power-max-washing-powder-3d-power-wash-1kg-1343': 'blue',
  'premium-liquid-detergent-3d-power-cleaning-1kg-': 'blue',
  'onium-hand-wash-creamy-moisturizer-500ml-': 'teal',
  'onium-toilet-cleaner-deep-clean-fumes-free-500ml': 'blue',
};

/** Falls back by category so a newly added product still gets a sane colour. */
const BY_CATEGORY: Record<string, AccentName> = {
  'Dishwashing': 'gold',
  'Floor Cleaners': 'gold',
  'Glass Cleaners': 'cyan',
  'Laundry Care': 'blue',
  'Personal Care': 'teal',
  'Toilet and Bathroom Acid Cleaner': 'blue',
};

export function accentFor(product: { slug?: string; category?: string }): Accent {
  const name =
    (product.slug && BY_SLUG[product.slug]) ||
    (product.category && BY_CATEGORY[product.category]) ||
    'blue';
  return ACCENTS[name];
}
