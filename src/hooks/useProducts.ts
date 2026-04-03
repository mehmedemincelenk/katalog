import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import {
  sortCategories,
  STORAGE_KEY,
  CATEGORY_ORDER as DEFAULT_ORDER,
} from '../data/config';
import { Product } from '../types';

const SHEET_URL = import.meta.env.VITE_SHEET_URL || '';
const APPS_SCRIPT_URL = import.meta.env.VITE_SHEET_SCRIPT_URL || '';
const ORDER_KEY = STORAGE_KEY + '_order';

/**
 * useProducts Hook
 */
export function useProducts(
  search = '',
  activeCategories: string[] = [],
  isAdmin = false,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => {
    const stored = localStorage.getItem(ORDER_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ORDER;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync İşlemleri
  const syncWithSheet = useCallback(
    async (action: string, payload: unknown) => {
      if (!APPS_SCRIPT_URL) {
        console.warn('Apps Script URL is missing!');
        return false;
      }
      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            ...(payload as Record<string, unknown>),
          }),
        });
        return true;
      } catch (err) {
        console.error('[Sync] Error sending data:', err);
        return false;
      }
    },
    [],
  );

  // 1. Verileri Google Sheets'den Çek
  useEffect(() => {
    if (!SHEET_URL) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data.map((item: unknown) => {
              const i = item as Record<string, unknown>;
              return {
                ...i,
                id: String(i.id),
                inStock:
                  i.inStock === 'TRUE' ||
                  i.inStock === 'true' ||
                  i.inStock === true ||
                  !Object.prototype.hasOwnProperty.call(i, 'inStock'),
                is_archived:
                  i.is_archived === 'TRUE' ||
                  i.is_archived === 'true' ||
                  i.is_archived === true,
              };
            }) as Product[];
            setProducts(parsedData);
            setError(null);
            setLoading(false);
          },
          error: () => {
            setError('Bakım Modu');
            setLoading(false);
          },
        });
      } catch (err) {
        console.error(err);
        setError('Katalog şu an bakımdadır.');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 2. Arama Loglama (Google Sheets'e Yazma)
  const logSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < 3) return;
      await syncWithSheet('LOG_SEARCH', { term });
    },
    [syncWithSheet],
  );

  // Debounce Search Log
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) logSearch(search);
    }, 2000);
    return () => clearTimeout(timer);
  }, [search, logSearch]);

  // Kategori sıralamasını her değiştiğinde kaydet
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(ORDER_KEY, JSON.stringify(categoryOrder));
  }, [categoryOrder]);

  // Yeni bir kategori eklendiğinde sıralamaya dahil et
  useEffect(() => {
    if (products.length === 0) return;
    const uniqueCats = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    const missingCats = uniqueCats.filter((c) => !categoryOrder.includes(c));
    if (missingCats.length > 0) {
      setTimeout(
        () => setCategoryOrder((prev) => [...prev, ...missingCats]),
        0,
      );
    }
  }, [products, categoryOrder]);

  // Filtreleme Mantığı
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((p) => {
      if (!isAdmin && p.is_archived) return false;
      const matchSearch = !term || p.name.toLowerCase().includes(term);
      const matchCategory =
        activeCategories.length === 0 || activeCategories.includes(p.category);
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategories, isAdmin]);

  const existingCategories = useMemo(() => {
    const unique = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    return sortCategories(unique, categoryOrder);
  }, [products, categoryOrder]);

  const addProduct = async (
    product: Omit<Product, 'id' | 'inStock' | 'is_archived'>,
  ) => {
    const newId = String(Date.now());
    const fullProduct: Product = {
      ...product,
      id: newId,
      inStock: true,
      is_archived: false,
    };
    setProducts((prev) => [fullProduct, ...prev]);
    await syncWithSheet('ADD', { product: fullProduct });
  };

  const removeProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await syncWithSheet('DELETE', { id });
  };

  const updateProduct = async (id: string, changes: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    );
    await syncWithSheet('UPDATE', { id, changes });
  };

  const renameCategory = async (oldName: string, newName: string) => {
    if (!oldName || !newName || oldName === newName) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.category === oldName ? { ...p, category: newName } : p,
      ),
    );
    setCategoryOrder((prev) => prev.map((c) => (c === oldName ? newName : c)));
    await syncWithSheet('RENAME_CATEGORY', { oldName, newName });
  };

  const removeCategoryFromProducts = async (catName: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.category === catName ? { ...p, category: '' } : p)),
    );
    setCategoryOrder((prev) => prev.filter((c) => c !== catName));
    await syncWithSheet('DELETE_CATEGORY', { catName });
  };

  const updateCategoryOrder = async (newOrder: string[]) => {
    setCategoryOrder(newOrder);
    const uniqueCats = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    const filteredOrder = newOrder.filter((name) => uniqueCats.includes(name));
    const orderList = filteredOrder.map((name, idx) => ({
      name,
      order: idx + 1,
    }));
    await syncWithSheet('UPDATE_CATEGORY_ORDER', { orderList });
  };

  return {
    products: filteredProducts,
    allProducts: products,
    existingCategories,
    categoryOrder,
    loading,
    error,
    updateProduct,
    removeProduct,
    addProduct,
    renameCategory,
    removeCategoryFromProducts,
    updateCategoryOrder,
  };
}
