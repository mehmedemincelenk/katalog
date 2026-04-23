// FILE ROLE: Logic Engine for Currency, Discounts, and Price Formatting
// DEPENDS ON: TECH constants, ExchangeRates type
import { TECH } from '../data/config';
import { ExchangeRates } from '../types';

/**
 * PRICE & CURRENCY UTILS
 * -----------------------------------------------------------
 * Specialized arithmetic tools for handling localized currency formatting,
 * discount logic, and real-time exchange rate fetching.
 */

const { commerce } = TECH;
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/TRY';

/**
 * fetchCurrentRates: Fetches real-time exchange rates from public API.
 */
export async function fetchCurrentRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(EXCHANGE_API_URL);
    if (!response.ok) throw new Error('Currency API error');
    const data = await response.json();

    // API returns values relative to 1 TRY. (e.g. USD: 0.030)
    // We need how many TRY for 1 USD. (e.g. 33.33 TRY)
    return {
      usd: parseFloat((1 / data.rates.USD).toFixed(4)),
      eur: parseFloat((1 / data.rates.EUR).toFixed(4)),
      lastUpdate: data.time_last_updated,
    };
  } catch (error) {
    console.error('Failed to fetch currency rates:', error);
    return null;
  }
}

/**
 * transformCurrencyStringToNumber: Converts localized price strings into pure numbers.
 * Handles: "1.250,50", "1,250.50", "₺1.250,50"
 */
export const transformCurrencyStringToNumber = (
  localizedPrice: string | number,
): number => {
  if (typeof localizedPrice === 'number') return localizedPrice;
  if (!localizedPrice) return 0;

  let cleanValue = localizedPrice.toString().replace(/[^\d.,]/g, '');
  const lastDotIndex = cleanValue.lastIndexOf('.');
  const lastCommaIndex = cleanValue.lastIndexOf(',');

  if (lastDotIndex > lastCommaIndex) {
    cleanValue = cleanValue.replace(/,/g, '');
  } else if (lastCommaIndex > lastDotIndex) {
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } else {
    cleanValue = cleanValue.replace(',', '.');
  }

  const result = parseFloat(cleanValue);
  return isNaN(result) ? 0 : result;
};

/**
 * formatNumberToCurrency: Converts pure numbers back into localized currency strings.
 */
export const formatNumberToCurrency = (
  numericalAmount: number,
  targetCurrency: 'TRY' | 'USD' | 'EUR' = 'TRY',
  exchangeRates?: { usd: number; eur: number },
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
 * calculatePromotionalPrice: Applies a discount rate to a localized price.
 */
export const calculatePromotionalPrice = (
  originalPriceString: string,
  discountRate: number,
): string => {
  const mathematicalBasePrice =
    transformCurrencyStringToNumber(originalPriceString);
  if (mathematicalBasePrice === 0) return originalPriceString;
  const finalizedDiscountedPrice = mathematicalBasePrice * (1 - discountRate);
  return formatNumberToCurrency(finalizedDiscountedPrice);
};

/**
 * standardizePriceInput: Ensures the price follows the standard "₺1.250" format
 */
export const standardizePriceInput = (input: string): string => {
  let cleanValue = input.trim();
  if (!cleanValue) return '';
  if (
    !cleanValue.startsWith('₺') &&
    !isNaN(transformCurrencyStringToNumber(cleanValue))
  ) {
    cleanValue = '₺' + cleanValue;
  }
  return cleanValue;
};
