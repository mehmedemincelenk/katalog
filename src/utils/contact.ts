// FILE: src/utils/contact.ts
// ROLE: Standardizes communication links and formatting for messaging integrations
// READS FROM: None
// USED BY: Components needing to generate communication links, e.g., Footer

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
// ARCHITECTURE: formatPhoneNumberForWhatsApp
// PURPOSE: Removes all non-numeric characters to create a valid number format for the WhatsApp API
// DEPENDENCIES: None
// CONSUMERS: generateWhatsAppLink
export const formatPhoneNumberForWhatsApp = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  // Remove spaces, dashes, parentheses and the leading '+' (wa.me doesn't need it)
  return phoneNumber.replace(/\D/g, '');
};

/**
 * generateWhatsAppLink:
 * Creates a professional encoded WhatsApp API link.
 */
// ARCHITECTURE: generateWhatsAppLink
// PURPOSE: Constructs a full wa.me URL with an optional pre-filled message
// DEPENDENCIES: formatPhoneNumberForWhatsApp
// CONSUMERS: Footer, contact buttons
export const generateWhatsAppLink = (number: string, message?: string): string => {
  const cleanNumber = formatPhoneNumberForWhatsApp(number);
  const encodedText = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanNumber}${encodedText ? `?text=${encodedText}` : ''}`;
};
