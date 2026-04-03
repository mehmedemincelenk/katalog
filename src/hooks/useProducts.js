import { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { sortCategories, STORAGE_KEY, CATEGORY_ORDER as DEFAULT_ORDER } from '../data/config';

const SHEET_URL = import.meta.env.VITE_SHEET_URL || ''; 
const APPS_SCRIPT_URL = import.meta.env.VITE_SHEET_SCRIPT_URL || ''; 
const ORDER_KEY = STORAGE_KEY + '_order';

// CSV Linkini Sayfa Adına Göre Değiştirme Fonksiyonu
const getSheetUrl = (base, sheetName) => {
  return base.replace('pub?output=csv', `pub?gid=${sheetName}&output=csv`);
};

// Sayfa GID'leri (Google Sheet'te her sekmenin URL'sindeki gid=... kısmıdır)
const GIDS = {
  products: '0', // Varsayılan ilk sayfa genelde 0'dır
  categories: '123456789' // Sizin Sheet'inizden bakıp düzeltmemiz gerekecek
};

/**
 * useProducts Hook
 * 
 * Google Sheets ile ürün verilerini, kategori sıralamasını ve arama kayıtlarını yönetir.
 * 
 * @param {string} search - Arama terimi (debounce ile loglanır)
 * @param {Array} activeCategories - Filtreleme için aktif kategori listesi
 * @param {boolean} isAdmin - Admin modu aktif mi? (Arşivlenmiş ürünleri görme yetkisi)
 * 
 * @returns {Object} { products, allProducts, existingCategories, categoryOrder, loading, error, ...actions }
 */
export function useProducts(search = '', activeCategories = [], isAdmin = false) {
  const [products, setProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState(() => {
    const stored = localStorage.getItem(ORDER_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ORDER;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Verileri Google Sheets'den Çek
  useEffect(() => {
    if (!SHEET_URL) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(SHEET_URL); // İlk sayfa (products)
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data.map(item => ({
              ...item,
              id: Number(item.id),
              inStock: item.inStock === 'TRUE' || item.inStock === 'true' || item.inStock === true || !item.hasOwnProperty('inStock'),
              is_archived: item.is_archived === 'TRUE' || item.is_archived === 'true' || item.is_archived === true,
            }));
            setProducts(parsedData);
            setError(null);
            setLoading(false);
          },
          error: () => { setError("Bakım Modu"); setLoading(false); }
        });
      } catch (err) {
        setError("Katalog şu an bakımdadır.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 2. Arama Loglama (Google Sheets'e Yazma)
  const logSearch = useCallback(async (term) => {
    if (!term || term.length < 3) return;
    await syncWithSheet('LOG_SEARCH', { term });
  }, []);

  // Debounce Search Log
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) logSearch(search);
    }, 2000);
    return () => clearTimeout(timer);
  }, [search, logSearch]);

  // Kategori sıralamasını her değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(categoryOrder));
  }, [categoryOrder]);

  // Yeni bir kategori eklendiğinde sıralamaya dahil et
  useEffect(() => {
    if (products.length === 0) return;
    const uniqueCats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const missingCats = uniqueCats.filter(c => !categoryOrder.includes(c));
    if (missingCats.length > 0) {
      setCategoryOrder(prev => [...prev, ...missingCats]);
    }
  }, [products]);

  // Filtreleme Mantığı
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((p) => {
      if (!isAdmin && p.is_archived) return false;
      const matchSearch = !term || p.name.toLowerCase().includes(term);
      const matchCategory = activeCategories.length === 0 || activeCategories.includes(p.category);
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategories, isAdmin]);

  const existingCategories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return sortCategories(unique, categoryOrder);
  }, [products, categoryOrder]);

  // Sync İşlemleri
  const syncWithSheet = async (action, payload) => {
    if (!APPS_SCRIPT_URL) {
      console.warn("Apps Script URL is missing!");
      return false;
    }
    console.log(`[Sync] Sending action: ${action}`, payload);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      return true; 
    } catch (err) {
      console.error("[Sync] Error sending data:", err);
      return false;
    }
  };

  const addProduct = async (product) => {
    const newId = Date.now();
    const fullProduct = { ...product, id: newId, inStock: true, is_archived: false };
    setProducts(prev => [fullProduct, ...prev]);
    await syncWithSheet('ADD', { product: fullProduct });
  };

  const removeProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await syncWithSheet('DELETE', { id });
  };

  const updateProduct = async (id, changes) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
    await syncWithSheet('UPDATE', { id, changes });
  };

  const renameCategory = async (oldName, newName) => {
    if (!oldName || !newName || oldName === newName) return;
    setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p));
    setCategoryOrder(prev => prev.map(c => c === oldName ? newName : c));
    await syncWithSheet('RENAME_CATEGORY', { oldName, newName });
  };

  const removeCategoryFromProducts = async (catName) => {
    setProducts(prev => prev.map(p => p.category === catName ? { ...p, category: null } : p));
    setCategoryOrder(prev => prev.filter(c => c !== catName));
    await syncWithSheet('DELETE_CATEGORY', { catName });
  };

  const updateCategoryOrder = async (newOrder) => {
    setCategoryOrder(newOrder);
    // Kategori tablosunu da güncelle (Sadece şu an ürünlerde olanları gönder)
    const uniqueCats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const filteredOrder = newOrder.filter(name => uniqueCats.includes(name));
    const orderList = filteredOrder.map((name, idx) => ({ name, order: idx + 1 }));
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
    updateCategoryOrder
  };
}
