const rupees = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

/** Keeps "Rs" and the amount on the same line when the text wraps. */
const NBSP = String.fromCharCode(160);

/** "Rs 3,000" — the format used on the packaging and across the site. */
export const formatRs = (amount: number) => `Rs${NBSP}${rupees.format(Math.round(amount))}`;

/**
 * Product titles in the database are written for search ("Onium Power Max
 * Washing Powder – 3D Power Wash (1kg)"). On a phone that's three lines of
 * noise, so split it into a short name and a detail line. The brand prefix is
 * dropped from the name because the logo is already on every screen.
 */
export function splitTitle(title: string): { name: string; detail: string } {
  const [head, ...rest] = title.split(/\s+[–—-]\s+/);
  const name = head.replace(/^Onium\s+/i, '').trim() || head.trim();
  return { name, detail: rest.join(' – ').trim() };
}

/** Category names are long in the database; the chips need them short. */
const SHORT_CATEGORY: Record<string, string> = {
  'Toilet and Bathroom Acid Cleaner': 'Toilet & bathroom',
};

export const categoryLabel = (category: string) => SHORT_CATEGORY[category] ?? category;
