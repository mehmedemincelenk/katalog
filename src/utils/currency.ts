// FILE ROLE: Real-time Exchange Rate Fetcher
// CONSUMED BY: useSettings.ts, App.tsx
/**
 * AUTOMATIC CURRENCY ENGINE
 * -----------------------------------------------------------
 * Fetches real-time exchange rates from public API without requiring keys.
 */

const API_URL = 'https://api.exchangerate-api.com/v4/latest/TRY';

export interface ExchangeRates {
  usd: number;
  eur: number;
  lastUpdate: number;
}

export async function fetchCurrentRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Currency API error');
    
    const data = await response.json();
    
    // API returns values relative to 1 TRY. (e.g. USD: 0.030)
    // We need how many TRY for 1 USD. (e.g. 33.33 TRY)
    return {
      usd: parseFloat((1 / data.rates.USD).toFixed(4)),
      eur: parseFloat((1 / data.rates.EUR).toFixed(4)),
      lastUpdate: data.time_last_updated
    };
  } catch (error) {
    console.error('Failed to fetch currency rates:', error);
    return null;
  }
}
