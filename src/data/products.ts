// FILE: src/data/products.ts
// ROLE: Fallback/Default product data used as a last resort if database connections fail
// READS FROM: src/types
// USED BY: Product hooks or initialization logic

// ============================================================
// DEFAULT PRODUCTS (YEDEK ÜRÜN HAVUZU)
// ============================================================
/**
 * KURUCU NOTU:
 * Bu dosya senin mağazanın "Sigortası"dır. 
 * 
 * TEORİK MANTIK:
 * Eğer veritabanı bağlantısında bir sorun olursa veya internet kesilirse, 
 * sitenin tamamen boş görünmemesi için bu listedeki ürünler devreye girer. 
 * 
 * TEKNİK MANTIK:
 * 'DEFAULT_PRODUCTS' bir dizidir (Array). İçindeki her obje bir ürünü temsil eder.
 */

import { Product } from '../types';

// ARCHITECTURE: DEFAULT_PRODUCTS
// PURPOSE: Array of default product objects to render if the primary data source is empty or unavailable
// DEPENDENCIES: Product type definition
// CONSUMERS: Initialization logic, default state
export const DEFAULT_PRODUCTS: Product[] = [
  // Örnek: Eğer Sheets boşsa mağazada görünecek temel ürünler buraya eklenebilir.
  /* 
  {
    id: 'starter-1',
    name: 'Örnek Kraft Kutu',
    category: 'Kargo Kutusu',
    price: '₺10,00',
    image: null,
    description: 'Varsayılan başlangıç ürünü.',
    inStock: true,
    is_archived: false
  }
  */
];
