// FILE ROLE: Communication Link Generator (WhatsApp, Tel)
// CONSUMED BY: Navbar, FloatingGuestMenu, ProductCard
/**
 * CONTACT UTILS
 * -----------------------------------------------------------
 * Standardizes communication links and data formatting.
 */

/**
 * formatPhoneNumberForWhatsApp: 
 * Strips all non-numeric characters from a string to ensure
 * a clean wa.me/XXXXXXXXXXX link format.
 */
export const formatPhoneNumberForWhatsApp = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  // Remove spaces, dashes, parentheses and the leading '+' (wa.me doesn't need it)
  return phoneNumber.replace(/\D/g, '');
};

/**
 * generateWhatsAppLink:
 * Creates a professional encoded WhatsApp API link.
 */
export const generateWhatsAppLink = (number: string, message?: string): string => {
  const cleanNumber = formatPhoneNumberForWhatsApp(number);
  const encodedText = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanNumber}${encodedText ? `?text=${encodedText}` : ''}`;
};
