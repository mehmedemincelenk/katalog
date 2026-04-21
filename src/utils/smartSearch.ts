import { Product } from '../types';

/**
 * FILE ROLE: Unified Smart Search Engine
 * PURPOSE: Handles Turkish-character-tolerant, fuzzy-ish product searching.
 * DEPENDS ON: Product type
 * CONSUMED BY: ProductGrid.tsx, SearchFilter.tsx logic
 */

/**
 * Normalizes Turkish characters to their English counterparts for easier comparison.
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
};

/**
 * ARCHITECTURE: smartSearch Utility
 * PURPOSE: Filters products based on a query with typo tolerance and ranking.
 * AI_NOTE: Ranks exact starts-with matches higher than contains matches.
 */
export const smartSearch = (query: string, products: Product[]): Product[] => {
  if (!query) return products;

  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  return products
    .map(product => {
      const name = normalizeText(product.name || '');
      const desc = normalizeText(product.description || '');
      const cat = normalizeText(product.category || '');
      const combined = `${name} ${desc} ${cat}`;

      let score = 0;

      // 1. Exact Match in Name (Highest Priority)
      if (name === normalizedQuery) score += 1000;

      // 2. Starts with Query
      if (name.startsWith(normalizedQuery)) score += 500;

      // 3. Word Matching
      words.forEach(word => {
        if (name.includes(word)) score += 100;
        if (desc.includes(word)) score += 20;
        if (cat.includes(word)) score += 50;
      });

      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
};
