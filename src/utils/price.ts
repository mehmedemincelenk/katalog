// FILE ROLE: Logic Engine for Currency, Discounts, and Price Formatting
// DEPENDS ON: TECH constants
// CONSUMED BY: ProductCard.tsx, BulkPriceUpdateModal.tsx, App.tsx
import { TECH } from '../data/config';

/**
 * PRICE UTILS (INVENTORY & CURRENCY CALCULATION)
 * -----------------------------------------------------------
 * Specialized arithmetic tools for handling localized currency formatting and logic.
 * Driven by central COMMERCE design tokens.
 */

const { commerce } = TECH;

/**
 * transformCurrencyStringToNumber: Converts localized price strings into pure numbers.
 * Handles: "1.250,50", "1,250.50", "1250,50", "1250.50", "₺1.250,50"
 * @param localizedPrice - The raw currency string from UI or storage.
 */
export const transformCurrencyStringToNumber = (localizedPrice: string | number): number => {
  if (typeof localizedPrice === 'number') return localizedPrice;
  if (!localizedPrice) return 0;

  // 1. Remove currency symbols and non-numeric/separator characters
  let cleanValue = localizedPrice.toString().replace(/[^\d.,]/g, '');

  // 2. Logic to determine decimal vs thousand separator:
  // We look for the LAST separator (comma or dot).
  const lastDotIndex = cleanValue.lastIndexOf('.');
  const lastCommaIndex = cleanValue.lastIndexOf(',');

  if (lastDotIndex > lastCommaIndex) {
    // Dot is likely the decimal (International style: 1,250.50)
    // Remove all commas and keep the dot
    cleanValue = cleanValue.replace(/,/g, '');
  } else if (lastCommaIndex > lastDotIndex) {
    // Comma is likely the decimal (Turkish style: 1.250,50)
    // Remove all dots and replace comma with dot for parseFloat
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } else {
    // Only one type of separator or none at all (e.g., "1250,50" or "1250.50")
    cleanValue = cleanValue.replace(',', '.');
  }

  const result = parseFloat(cleanValue);
  return isNaN(result) ? 0 : result;
};

/**
 * formatNumberToCurrency: Converts pure numbers back into localized currency strings.
 * Uses TECH.commerce for internationalization, and auto-converts based on exchange rates.
 * @param numericalAmount - The mathematical value to be formatted (Always in TRY originally).
 * @param targetCurrency - The requested display currency ('TRY', 'USD', 'EUR').
 * @param exchangeRates - Current exchange rates from settings.
 */
export const formatNumberToCurrency = (
  numericalAmount: number,
  targetCurrency: 'TRY' | 'USD' | 'EUR' = 'TRY',
  exchangeRates?: { usd: number; eur: number }
): string => {
  let convertedAmount = numericalAmount;
  let activeCurrencyCode = commerce.currency;

  if (targetCurrency !== 'TRY' && exchangeRates) {
    if (targetCurrency === 'USD' && exchangeRates.usd > 0) {
      convertedAmount = numericalAmount / exchangeRates.usd;
      activeCurrencyCode = 'USD';
    } else if (targetCurrency === 'EUR' && exchangeRates.eur > 0) {
      convertedAmount = numericalAmount / exchangeRates.eur;
      activeCurrencyCode = 'EUR';
    }
  }

  return new Intl.NumberFormat(commerce.locale, {
    style: 'currency',
    currency: activeCurrencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
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

/**
 * standardizePriceInput: Ensures the price follows the standard "₺1.250" format
 */
export const standardizePriceInput = (input: string): string => {
  let cleanValue = input.trim();
  if (!cleanValue) return '';
  // Only add currency symbol if it's a numeric-like value and doesn't have it
  if (!cleanValue.startsWith('₺') && !isNaN(transformCurrencyStringToNumber(cleanValue))) {
    cleanValue = '₺' + cleanValue;
  }
  return cleanValue;
};
