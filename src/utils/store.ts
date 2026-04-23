// FILE ROLE: SaaS Store Resolver & Communication Link Generator
// CONSUMED BY: useProducts, useSettings, useAdminMode, Navbar, FloatingGuestMenu, ProductCard

/**
 * STORE & CONTACT UTILS
 * -----------------------------------------------------------
 * SaaS mimarisinde aktif dükkanı çözer ve iletişim linklerini standardize eder.
 */

/**
 * getActiveStoreSlug: Resolves the active store slug from URL or Environment.
 */
export const getActiveStoreSlug = (): string => {
  if (typeof window === 'undefined') return 'main-site';

  const hostname = window.location.hostname.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('main') === '1') return 'main-site';

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.') ||
    hostname.startsWith('10.') ||
    import.meta.env.DEV
  ) {
    let envSlug = import.meta.env.VITE_STORE_SLUG;
    if (envSlug) envSlug = envSlug.replace(/-/g, '');
    return envSlug && envSlug !== 'mainsite' ? envSlug : 'toptanambalajcim';
  }

  const parts = hostname.split('.');
  if (parts.length <= 2 || (parts.length === 3 && parts[0] === 'www')) {
    return 'main-site';
  }

  return parts[0];
};

/**
 * formatPhoneNumberForWhatsApp:
 * Strips all non-numeric characters from a string.
 */
export const formatPhoneNumberForWhatsApp = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  return phoneNumber.replace(/\D/g, '');
};

/**
 * generateWhatsAppLink:
 * Creates a professional encoded WhatsApp API link.
 */
export const generateWhatsAppLink = (
  number: string,
  message?: string,
): string => {
  const cleanNumber = formatPhoneNumberForWhatsApp(number);
  const encodedText = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanNumber}${encodedText ? `?text=${encodedText}` : ''}`;
};
