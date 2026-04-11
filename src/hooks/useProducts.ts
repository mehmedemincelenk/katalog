import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  sortCategories,
  LABELS,
} from '../data/config';
import { Product } from '../types';
import { useSettings } from './useSettings';

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;
const TABLE_NAME = STORE_SLUG === 'toptan-ambalajcim' ? 'products_toptanAmbalajcim' : `products_${STORE_SLUG.replace(/-/g, '_')}`;

export function useProducts(
  search = '',
  activeCategories: string[] = [],
  isAdmin = false,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const { settings, updateSetting, loading: settingsLoading } = useSettings(isAdmin);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    const { data, error } = await supabase.from(TABLE_NAME).select('*').order('sort_order', { ascending: true });
    if (data && !error) {
      setProducts(data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image_url,
        description: p.description || '',
        inStock: !p.out_of_stock,
        is_archived: p.is_archived,
        sort_order: p.sort_order || 0
      })));
    }
    if (!isSilent) setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateProduct = useCallback(async (id: string, changes: Partial<Product>) => {
    // RESİM HARİÇ her şeyi optimistic güncelle
    if (!changes.image) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
    }

    const payload: any = {};
    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.category !== undefined) payload.category = changes.category;
    if (changes.price !== undefined) payload.price = changes.price;
    if (changes.image !== undefined) payload.image_url = changes.image;
    if (changes.description !== undefined) payload.description = changes.description;
    if (changes.inStock !== undefined) payload.out_of_stock = !changes.inStock;
    if (changes.is_archived !== undefined) payload.is_archived = changes.is_archived;
    if (changes.sort_order !== undefined) payload.sort_order = changes.sort_order;

    const { error } = await supabase.from(TABLE_NAME).update(payload).eq('id', id);
    if (error) {
      console.error('Update error:', error);
      fetchProducts(true);
    } else if (changes.image) {
      // Resim güncellendiyse listeyi hemen tazele
      fetchProducts(true);
    }
  }, [fetchProducts]);

  const uploadImage = useCallback(async (productId: string, file: File) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Ürün bulunamadı.');

      const { processDualImage } = await import('../utils/image');
      const { hq, lq } = await processDualImage(file);

      // 1. ESKİ RESMİ SİL (Eski dosyalar birikmesin)
      if (product.image) {
        try {
          const oldUrl = new URL(product.image);
          const oldFile = oldUrl.pathname.split('/').pop();
          if (oldFile) await supabase.storage.from('product-images').remove([`lq/${oldFile}`, `hq/${oldFile}`]);
        } catch (e) {}
      }

      // 2. YENİ DOSYA ADI (Unique suffix ile çakışmayı bitir)
      const trMap: any = { 'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','Ç':'C','Ğ':'G','İ':'I','Ö':'O','Ş':'S','Ü':'U' };
      const cleanName = (product.name).replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m]).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').substring(0, 30);
      const uniqueSuffix = Math.random().toString(36).substring(2, 7); // ax4v2 gibi
      const fileName = `${cleanName}-${productId.substring(0, 4)}-${uniqueSuffix}.jpg`;

      const lqPath = `lq/${fileName}`;
      const hqPath = `hq/${fileName}`;

      // 3. YÜKLE (Cache kapatarak)
      const { error: lqErr } = await supabase.storage.from('product-images').upload(lqPath, lq, { 
        upsert: true, 
        cacheControl: '0' 
      });
      if (lqErr) throw lqErr;

      const { error: hqErr } = await supabase.storage.from('product-images').upload(hqPath, hq, { 
        upsert: true, 
        cacheControl: '0' 
      });
      if (hqErr) throw hqErr;

      // 4. VERİTABANINI GÜNCELLE
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(lqPath);
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      await updateProduct(productId, { image: finalUrl });
      return finalUrl;

    } catch (err: any) {
      alert('Resim yükleme hatası: ' + (err.message || 'Bilinmeyen hata'));
      console.error('Image upload failed:', err);
      throw err;
    }
  }, [products, updateProduct]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'is_archived'>, imageFile?: File) => {
    // Calculate max sort_order for the given category to place the new product at the end
    const categoryProducts = products.filter(p => p.category === product.category);
    const maxSortOrder = categoryProducts.length > 0 
      ? Math.max(...categoryProducts.map(p => p.sort_order || 0)) 
      : 0;
    const nextSortOrder = maxSortOrder + 1;

    const { data, error } = await supabase.from(TABLE_NAME).insert([{
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      out_of_stock: !product.inStock,
      is_archived: false,
      sort_order: nextSortOrder
    }]).select().single();

    if (data && !error) {
      if (imageFile) await uploadImage(data.id, imageFile);
      else fetchProducts(true);
    }
  }, [uploadImage, fetchProducts, products]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!window.confirm(LABELS.deleteConfirm)) return;
    const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (!error && product?.image) {
      try {
        const url = new URL(product.image);
        const fileName = url.pathname.split('/').pop();
        if (fileName) await supabase.storage.from('product-images').remove([`lq/${fileName}`, `hq/${fileName}`]);
      } catch (e) {}
      fetchProducts(true);
    } else if (error) {
      fetchProducts();
    }
  }, [products, fetchProducts]);

  const deleteAllProducts = useCallback(async () => {
    if (!window.confirm('Tüm ürünler silinecek. Emin misiniz?')) return;
    await supabase.from(TABLE_NAME).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    fetchProducts();
  }, [fetchProducts]);

  const reorderCategory = useCallback((catName: string, newPosition: number) => {
    const currentOrder = settings.categoryOrder;
    const others = currentOrder.filter(c => c !== catName);
    const result = [...others.slice(0, newPosition - 1), catName, ...others.slice(newPosition - 1)];
    updateSetting('categoryOrder', result);
  }, [settings.categoryOrder, updateSetting]);

  const renameCategory = useCallback(async (oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;
    setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p));
    const { error } = await supabase.from(TABLE_NAME).update({ category: newName }).eq('category', oldName);
    if (!error) {
      const newOrder = settings.categoryOrder.map(c => c === oldName ? newName : c);
      updateSetting('categoryOrder', newOrder);
      fetchProducts(true);
    }
  }, [settings.categoryOrder, updateSetting, fetchProducts]);

  const removeCategoryFromProducts = useCallback(async (catName: string) => {
    setProducts(prev => prev.map(p => p.category === catName ? { ...p, category: 'DİĞER' } : p));
    const { error } = await supabase.from(TABLE_NAME).update({ category: 'DİĞER' }).eq('category', catName);
    if (!error) {
      const newOrder = settings.categoryOrder.filter(c => c !== catName);
      updateSetting('categoryOrder', newOrder);
      fetchProducts(true);
    }
  }, [settings.categoryOrder, updateSetting, fetchProducts]);

  const reorderProductsInCategory = useCallback(async (productId: string, newPosition: number) => {
    await updateProduct(productId, { sort_order: newPosition });
  }, [updateProduct]);

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
    return sortCategories(unique, settings.categoryOrder);
  }, [products, settings.categoryOrder]);

  return {
    products: filteredProducts,
    allProducts: products,
    totalCount: filteredProducts.length,
    existingCategories,
    categoryOrder: settings.categoryOrder,
    loading: loading || settingsLoading,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    addProduct,
    reorderCategory,
    reorderProductsInCategory,
    renameCategory,
    removeCategoryFromProducts,
    uploadImage,
  };
}
