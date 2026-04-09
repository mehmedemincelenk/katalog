import { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import {
  sortCategories,
  TECH,
  STORAGE,
  LABELS,
  CATEGORY_ORDER as DEFAULT_ORDER,
} from '../data/config';
import { Product } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_PRODUCTS } from '../data/products';

/**
 * USE PRODUCTS HOOK (MAĞAZA MOTORU - %100 KARARLI SÜRÜM)
 */
export function useProducts(
  search = '',
  activeCategories: string[] = [],
  isAdmin = false,
) {
  // ANA ÜRÜN LİSTESİ (Master List)
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem(STORAGE.productsCache);
    return cached ? JSON.parse(cached) : DEFAULT_PRODUCTS;
  });
  
  const [categoryOrder, setCategoryOrder] = useLocalStorage<string[]>(STORAGE.categoryOrder, DEFAULT_ORDER);
  const [loading, setLoading] = useState(true);

  // Cache Yazımı
  useEffect(() => {
    if (products.length >= 0) {
      localStorage.setItem(STORAGE.productsCache, JSON.stringify(products));
    }
  }, [products]);

  const syncWithSheet = useCallback(async (action: string, payload: Record<string, any>) => {
    const url = import.meta.env.VITE_SHEET_SCRIPT_URL;
    if (!url) return;
    try {
      // Google Script için en kararlı gönderim yöntemi: text/plain
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, ...payload }),
      });
    } catch (err) {
      console.error(`[ERR] Sheet sync failed:`, err);
    }
  }, []);

  const mapToProduct = useCallback((raw: Record<string, any>): Product => ({
    id: String(raw.id || crypto.randomUUID()),
    name: String(raw.name || ''),
    category: String(raw.category || TECH.products.defaultCategory),
    price: String(raw.price || TECH.products.defaultPrice),
    image: raw.image || null,
    description: String(raw.description || ''),
    inStock: String(raw.inStock).toLowerCase() !== 'false',
    is_archived: String(raw.is_archived).toLowerCase() === 'true',
  }), []);

  // VERİ ÇEKME VE GOOGLE CACHE KONTROLÜ
  useEffect(() => {
    const url = import.meta.env.VITE_SHEET_URL;
    if (!url) { setLoading(false); return; }

    fetch(url)
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = (results.data as Record<string, any>[])
              .filter(raw => raw.name) // Sadece adı olan geçerli satırları al
              .map(mapToProduct);
            
            console.log(`[DEBUG] Sheet'ten ${parsed.length} ürün geldi.`);
            
            setProducts(prev => {
              const isClearing = localStorage.getItem('is_clearing_now') === 'true';
              
              // Eğer veriler geldiyse temizlik modunu otomatik kapat
              if (parsed.length > 0 && isClearing) {
                localStorage.removeItem('is_clearing_now');
                return parsed;
              }
              
              if (isClearing && parsed.length === 0) return [];
              
              return parsed.length > 0 ? parsed : prev;
            });
            setLoading(false);
          },
          error: (err) => {
            console.error('[ERR] PapaParse Hatası:', err);
            setLoading(false);
          }
        });
      })
      .catch((err) => {
        console.error('[ERR] Fetch Hatası:', err);
        setLoading(false);
      });
  }, [mapToProduct]);

  /**
   * deleteAllProducts: 
   * Filtreye bakmaksızın TÜM ürünleri Google Sheets'ten ve siteden siler.
   */
  const deleteAllProducts = useCallback(async () => {
    if (!window.confirm('DİKKAT: Mağazadaki TÜM ürünler (filtredekiler dahil) silinecek. Emin misiniz?')) return;
    
    // Sıkıyönetimi başlat (Google'dan gelecek 5 dakikalık "yalan" verileri engellemek için)
    localStorage.setItem('is_clearing_now', 'true');
    setProducts([]);
    localStorage.removeItem(STORAGE.productsCache);

    // Google'a tek bir "BOMBA" komutu gönder (Hepsini sök at)
    await syncWithSheet(TECH.sheetActions.deleteAll, {});

    alert('Silme komutu gönderildi. Google Sheets\'in temizlenmesi ve senkronizasyon birkaç saniye sürebilir. 🧹');
  }, [syncWithSheet]);

  const updateProduct = useCallback((id: string, changes: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
    syncWithSheet(TECH.sheetActions.update, { id, changes });
  }, [syncWithSheet]);

  const deleteProduct = useCallback((id: string) => {
    if (!window.confirm(LABELS.deleteConfirm)) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    syncWithSheet(TECH.sheetActions.delete, { id });
  }, [syncWithSheet]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'is_archived'>) => {
    // Yeni ürün eklendiğinde temizlik modunu zorla kapat.
    localStorage.removeItem('is_clearing_now');
    const full: Product = { ...product, id: crypto.randomUUID(), is_archived: false };
    setProducts(prev => [full, ...prev]);
    syncWithSheet(TECH.sheetActions.add, { product: full });
  }, [syncWithSheet]);

  const reorderProductsInCategory = useCallback((productId: string, newPosition: number) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === productId);
      if (!target) return prev;
      const catName = target.category || TECH.products.fallbackCategory;
      const catProducts = prev.filter(p => (p.category || TECH.products.fallbackCategory) === catName);
      const others = catProducts.filter(p => p.id !== productId);
      const sorted = [...others.slice(0, newPosition - 1), target, ...others.slice(newPosition - 1)];
      let i = 0;
      const result = prev.map(p => (p.category || TECH.products.fallbackCategory) === catName ? sorted[i++] : p);
      syncWithSheet(TECH.sheetActions.reorderProducts, { idList: result.map(x => x.id) });
      return result;
    });
  }, [syncWithSheet]);

  const reorderCategory = useCallback((catName: string, newPosition: number) => {
    const others = categoryOrder.filter(c => c !== catName);
    const result = [...others.slice(0, newPosition - 1), catName, ...others.slice(newPosition - 1)];
    setCategoryOrder(result);
    syncWithSheet(TECH.sheetActions.reorderCategories, { orderList: result.map((name, i) => ({ name, order: i + 1 })) });
  }, [categoryOrder, setCategoryOrder, syncWithSheet]);

  // FİLTRELEME (Sadece Görünüm İçin)
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter(p => {
      if (!isAdmin && p.is_archived) return false;
      const mS = !term || p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term);
      const mC = activeCategories.length === 0 || activeCategories.includes(p.category);
      return mS && mC;
    });
  }, [products, search, activeCategories, isAdmin]);

  const existingCategories = useMemo(() => {
    const unique = [...new Set(products.map(p => p.category).filter(Boolean))];
    return sortCategories(unique, categoryOrder);
  }, [products, categoryOrder]);

  return {
    products: filteredProducts,
    totalCount: filteredProducts.length,
    existingCategories,
    categoryOrder,
    loading,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    addProduct,
    reorderCategory,
    reorderProductsInCategory,
  };
}
