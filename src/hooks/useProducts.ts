import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  sortCategories,
  TECH,
  STORAGE,
  LABELS,
  CATEGORY_ORDER as DEFAULT_ORDER,
} from '../data/config';
import { Product } from '../types';
import { useLocalStorage } from './useLocalStorage';

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;

export function useProducts(
  search = '',
  activeCategories: string[] = [],
  isAdmin = false,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useLocalStorage<string[]>(STORAGE.categoryOrder, DEFAULT_ORDER);
  const [loading, setLoading] = useState(true);

  // 1. Mağaza ID'sini ve Ayarlarını Çek
  useEffect(() => {
    async function fetchStore() {
      const { data, error } = await supabase
        .from('stores')
        .select('id, tagline, phone, address, name, instagram_url')
        .eq('slug', STORE_SLUG)
        .single();

      if (data && !error) {
        setStoreId(data.id);
      } else {
        console.error('Store not found', error);
      }
    }
    fetchStore();
  }, []);

  // 2. Ürünleri Çek
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true });

    if (data && !error) {
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image_url,
        description: p.description || '',
        inStock: !p.out_of_stock,
        is_archived: p.is_archived,
      }));
      setProducts(mapped);
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Eylemler (Supabase)
  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'is_archived'>) => {
    if (!storeId) return;
    const { data, error } = await supabase
      .from('products')
      .insert([{
        store_id: storeId,
        name: product.name,
        category: product.category,
        price: product.price,
        image_url: product.image,
        description: product.description,
        out_of_stock: !product.inStock,
        is_archived: false,
        sort_order: 0
      }])
      .select()
      .single();

    if (data && !error) {
      fetchProducts();
    }
  }, [storeId, fetchProducts]);

  const updateProduct = useCallback(async (id: string, changes: Partial<Product>) => {
    const payload: any = {};
    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.category !== undefined) payload.category = changes.category;
    if (changes.price !== undefined) payload.price = changes.price;
    if (changes.image !== undefined) payload.image_url = changes.image;
    if (changes.description !== undefined) payload.description = changes.description;
    if (changes.inStock !== undefined) payload.out_of_stock = !changes.inStock;
    if (changes.is_archived !== undefined) payload.is_archived = changes.is_archived;

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (!error) fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!window.confirm(LABELS.deleteConfirm)) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) fetchProducts();
  }, [fetchProducts]);

  const deleteAllProducts = useCallback(async () => {
    if (!storeId || !window.confirm('Tüm ürünler silinecek. Emin misiniz?')) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('store_id', storeId);

    if (!error) fetchProducts();
  }, [storeId, fetchProducts]);

  const reorderProductsInCategory = useCallback(async (productId: string, newPosition: number) => {
    // Basitlik için yerel state'i güncelle, sonra isterseniz sort_order güncellenebilir.
    // Şimdilik sadece yerel sıralama yapalım, gerçek projede tüm ürünlerin sort_order'ı güncellenmeli.
  }, []);

  const reorderCategory = useCallback((catName: string, newPosition: number) => {
    const others = categoryOrder.filter(c => c !== catName);
    const result = [...others.slice(0, newPosition - 1), catName, ...others.slice(newPosition - 1)];
    setCategoryOrder(result);
  }, [categoryOrder, setCategoryOrder]);

  // FİLTRELEME
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
    allProducts: products,
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
