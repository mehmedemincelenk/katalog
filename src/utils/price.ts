import { TECH } from '../data/config';

/**
 * PRICE UTILS (INVENTORY & CURRENCY CALCULATION)
 * -----------------------------------------------------------
 * Specialized arithmetic tools for handling localized currency formatting and logic.
 * Driven by central COMMERCE design tokens.
 */

const { commerce } = TECH;

/**
 * transformCurrencyStringToNumber: Converts localized price strings (e.g., "₺150,50") into pure numbers.
 * @param localizedPrice - The raw currency string from UI or storage.
 */
export const transformCurrencyStringToNumber = (localizedPrice: string): number => {
  if (!localizedPrice) return 0;
  // Cleanup: Remove non-numeric characters except decimals, and normalize comma to dot
  const normalizedValue = localizedPrice.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(normalizedValue) || 0;
};

/**
 * formatNumberToCurrency: Converts pure numbers back into localized currency strings.
 * Uses TECH.commerce for internationalization.
 * @param numericalAmount - The mathematical value to be formatted.
 */
export const formatNumberToCurrency = (numericalAmount: number): string => {
  return new Intl.NumberFormat(commerce.locale, {
    style: 'currency',
    currency: commerce.currency,
    minimumFractionDigits: 2,
  }).format(numericalAmount);
};

/**
 * calculatePromotionalPrice: Applies a discount rate to a localized price and returns the formatted result.
 * @param originalPriceString - The baseline price label.
 * @param discountRate - The decimal percentage (e.g., 0.1 for 10%).
 */
export const calculatePromotionalPrice = (originalPriceString: string, discountRate: number): string => {
  const mathematicalBasePrice = transformCurrencyStringToNumber(originalPriceString);
  if (mathematicalBasePrice === 0) return originalPriceString;
  
  // Logic: Discounted Price = Base * (1 - Rate)
  const finalizedDiscountedPrice = mathematicalBasePrice * (1 - discountRate);
  return formatNumberToCurrency(finalizedDiscountedPrice);
};
