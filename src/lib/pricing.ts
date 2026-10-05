/**
 * Delivery pricing, in one place. The cart used to quote Rs 100 delivery
 * while checkout charged Rs 200; everything now reads from here.
 */
export const FREE_DELIVERY_FROM = 3000;
export const DELIVERY_FEE = 200;

export const deliveryFeeFor = (subtotal: number) => (subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE);
