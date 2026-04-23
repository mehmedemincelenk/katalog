import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Product, NewProductPayload, CompanySettings } from '../types';
import { getActiveStoreSlug } from '../utils/store';
import { useStore } from '../store/useStore';
import { useProductStorage } from './useProductStorage';
import { smartSearch } from '../utils/ai';
import { TECH, sortCategories } from '../data/config';

const STORE_SLUG = getActiveStoreSlug();

/**
 * PRODUCTS & CATALOG HUB (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Unified orchestrator for all product-related operations:
 * 1. Data Fetching (Query)
 * 2. Mutations (Add, Update, Delete, Bulk)
 * 3. Catalog Engine (Grouping, Filtering, Sorting)
 */

// --- 1. QUERY HOOK (Data Layer) ---

export function useProductsQuery() {
  return useQuery<Product[]>({
    queryKey: ['products', STORE_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prods')
        .select('*')
        .eq('store_slug', STORE_SLUG)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// --- 2. ACTIONS HOOK (Mutation Layer) ---

export function useProductsActions() {
  const queryClient = useQueryClient();
  const { settings } = useStore();
  const queryKey = ['products', STORE_SLUG];

  const updateMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Product> }) => {
      const { error } = await supabase.from('prods').update(changes).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: async (newOrder: string[]) => {
      const { error } = await supabase
        .from('stores')
        .update({ category_order: newOrder })
        .eq('slug', STORE_SLUG);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const renameCategoryMutation = useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
      const { error } = await supabase
        .from('prods')
        .update({ category: newName })
        .eq('category', oldName)
        .eq('store_slug', STORE_SLUG);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const reorderProductsMutation = useMutation({
    mutationFn: async ({ id, newSortOrder }: { id: string; newSortOrder: number }) => {
      const { error } = await supabase
        .from('prods')
        .update({ sort_order: newSortOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addMutation = useMutation({
    mutationFn: async (newProduct: NewProductPayload) => {
      if (!settings?.id) throw new Error('Mağaza ID bulunamadı');
      const { data, error } = await supabase.from('prods').insert([{
        ...newProduct,
        store_id: settings.id,
        out_of_stock: false,
        is_archived: false,
        sort_order: 0,
      }]).select('id').single();
      if (error) throw error;
      return data?.id as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const { uploadImage: storageUpload } = useProductStorage();

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const cachedProducts = queryClient.getQueryData<Product[]>(queryKey);
      const targetProduct = cachedProducts?.find((p) => p.id === id);
      if (!targetProduct) throw new Error('Ürün bulunamadı');
      const finalizedUrl = await storageUpload(targetProduct, file);
      if (finalizedUrl) {
        const { error } = await supabase.from('prods').update({
          image_url: finalizedUrl,
          is_polished_pending: false,
        }).eq('id', id);
        if (error) throw error;
      }
      return finalizedUrl;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const bulkActionMutation = useMutation({
    mutationFn: async (
      actions: {
        productId: string;
        newPrice?: number;
        category?: string;
        delete?: boolean;
        out_of_stock?: boolean;
        is_archived?: boolean;
      }[],
    ) => {
      for (const action of actions) {
        if (action.delete) {
          await supabase.from('prods').delete().eq('id', action.productId);
        } else {
          const update: Partial<Product> = {};
          if (action.newPrice !== undefined) {
            const { formatNumberToCurrency } = await import('../utils/price');
            update.price = formatNumberToCurrency(action.newPrice);
          }
          if (action.category !== undefined) update.category = action.category;
          if (action.out_of_stock !== undefined)
            update.out_of_stock = action.out_of_stock;
          if (action.is_archived !== undefined)
            update.is_archived = action.is_archived;

          if (Object.keys(update).length > 0) {
            await supabase
              .from('prods')
              .update(update)
              .eq('id', action.productId);
          }
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    addProduct: addMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    reorderCategories: reorderCategoryMutation.mutateAsync,
    renameCategory: renameCategoryMutation.mutateAsync,
    reorderProduct: reorderProductsMutation.mutateAsync,
    uploadImage: uploadImageMutation.mutateAsync,
    executeGranularBulkActions: bulkActionMutation.mutateAsync,
    isMutating:
      updateMutation.isPending ||
      deleteMutation.isPending ||
      addMutation.isPending ||
      uploadImageMutation.isPending ||
      bulkActionMutation.isPending ||
      reorderCategoryMutation.isPending ||
      renameCategoryMutation.isPending ||
      reorderProductsMutation.isPending,
  };
}

// --- 3. CATALOG ENGINE (Logic Layer) ---

export function useCatalogEngine(products: Product[], categoryOrder: string[], activeCategories: string[], isAdmin: boolean) {
  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.category || TECH.products.fallbackCategory;
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const displayCategories = useMemo(() => {
    const existingInProducts = Object.keys(groupedProducts);
    const allCategories = [...new Set([...categoryOrder, ...existingInProducts])];
    const filtered = activeCategories.length > 0 ? allCategories.filter(cat => activeCategories.includes(cat)) : allCategories;
    const sorted = sortCategories(filtered, categoryOrder);
    if (isAdmin) return sorted;
    return sorted.filter(cat => (groupedProducts[cat] || []).length > 0 || activeCategories.includes(cat));
  }, [groupedProducts, categoryOrder, activeCategories, isAdmin]);

  return { groupedProducts, displayCategories };
}

// --- 4. COORDINATOR HOOK (Main Entry) ---

export function useProducts(searchQuery: string, activeCategories: string[], isAdmin: boolean, settings: CompanySettings | null) {
  const { data: allProducts = [], isLoading: productsLoading } = useProductsQuery();
  const actions = useProductsActions();

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (!isAdmin) result = result.filter((p) => !p.is_archived);
    if (activeCategories.length > 0) result = result.filter((p) => activeCategories.includes(p.category));
    if (searchQuery) result = smartSearch(searchQuery, result);
    return result;
  }, [allProducts, searchQuery, activeCategories, isAdmin]);

  const categoryOrder = useMemo(() => settings?.categoryOrder || [], [settings?.categoryOrder]);

  return {
    products: filteredProducts,
    allProducts,
    categoryOrder,
    loading: productsLoading,
    addProduct: actions.addProduct,
    updateProduct: actions.updateProduct,
    deleteProduct: actions.deleteProduct,
    uploadImage: actions.uploadImage,
    renameCategory: actions.renameCategory,
    reorderCategories: actions.reorderCategories,
    executeGranularBulkActions: actions.executeGranularBulkActions,
    reorderCategory: async (categoryName: string, newPosition: number) => {
      const currentOrder = [...categoryOrder];
      const oldIndex = currentOrder.indexOf(categoryName);
      if (oldIndex === -1) return;
      currentOrder.splice(oldIndex, 1);
      currentOrder.splice(newPosition - 1, 0, categoryName);
      await actions.reorderCategories(currentOrder);
    },
    reorderProductsInCategory: async (id: string, newPosition: number) => {
      await actions.reorderProduct({ id, newSortOrder: newPosition });
    },
    addCategory: async (name: string) => {
      if (!settings?.id) return;
      await actions.addProduct({
        name: 'Yeni Ürün',
        category: name,
        price: '0',
        description: '',
        image_url: null,
        out_of_stock: false,
        is_archived: true,
        store_id: settings.id,
      });
    },
  };
}
