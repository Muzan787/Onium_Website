/** How customers reach Onium. One place, so every page says the same thing. */
export const WHATSAPP_NUMBER = '923231550147';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const PHONE_DISPLAY = '+92 323 1550147';
export const PHONE_HREF = 'tel:+923231550147';
export const EMAIL = 'rabta@onium.store';
export const ADDRESS = 'HM Towers, Office 402, 5th Floor, Gulberg Green, Islamabad';
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`HM Towers Gulberg Green Islamabad`)}`;
export const SUPPORT_HOURS = '9 AM to 9 PM every day';

export const whatsappWith = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
