import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  sortCategories,
  LABELS,
  TECH,
} from '../data/config';
import { Product } from '../types';
import { useSettings } from './useSettings';

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;
const REPOSITORY_TABLE = STORE_SLUG === 'toptan-ambalajcim' ? 'products_toptanAmbalajcim' : `products_${STORE_SLUG.replace(/-/g, '_')}`;

/**
 * USE PRODUCTS HOOK (INVENTORY & CATALOG ENGINE)
 * -----------------------------------------------------------
 * Manages product lifecycle, categorized display logic, and asset storage.
 */
export function useProducts(
  currentSearchQuery = '',
  activeFilterCategories: string[] = [],
  isAdministrativeModeActive = false,
) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const { settings: storeSettings, updateSetting: updateStoreSetting, loading: isSettingsLoading } = useSettings(isAdministrativeModeActive);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [inventoryErrorMessage, setInventoryErrorMessage] = useState<string | null>(null);

  /**
   * synchronizeInventory: Fetches all product records from Supabase repository.
   * @param isSilent - If true, loading state is not visually triggered (background sync).
   */
  const synchronizeInventory = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsInventoryLoading(true);
    setInventoryErrorMessage(null);
    
    const { data: repositoryData, error: fetchError } = await supabase
      .from(REPOSITORY_TABLE)
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (fetchError) {
      console.error('Inventory synchronization failed:', fetchError);
      setInventoryErrorMessage(LABELS.saveError);
    } else if (repositoryData) {
      // Logic Pattern: Map raw repository fields to professional Product interface
      setCatalogProducts(repositoryData.map(record => ({
        id: record.id,
        name: record.name,
        category: record.category,
        price: record.price,
        image: record.image_url,
        description: record.description || '',
        inStock: !record.out_of_stock,
        is_archived: record.is_archived,
        sort_order: record.sort_order || 0
      })));
    }
    
    if (!isSilent) setIsInventoryLoading(false);
  }, []);

  useEffect(() => { synchronizeInventory(); }, [synchronizeInventory]);

  /**
   * modifyProductRecord: Updates specific product data with optimistic UI feedback.
   */
  const modifyProductRecord = useCallback(async (productId: string, dataChanges: Partial<Product>) => {
    // Optimistic Update: Skip for image changes due to storage latency
    if (!dataChanges.image) {
      setCatalogProducts(previous => previous.map(p => p.id === productId ? { ...p, ...dataChanges } : p));
    }

    const updatePayload: any = {};
    if (dataChanges.name !== undefined) updatePayload.name = dataChanges.name;
    if (dataChanges.category !== undefined) updatePayload.category = dataChanges.category;
    if (dataChanges.price !== undefined) updatePayload.price = dataChanges.price;
    if (dataChanges.image !== undefined) updatePayload.image_url = dataChanges.image;
    if (dataChanges.description !== undefined) updatePayload.description = dataChanges.description;
    if (dataChanges.inStock !== undefined) updatePayload.out_of_stock = !dataChanges.inStock;
    if (dataChanges.is_archived !== undefined) updatePayload.is_archived = dataChanges.is_archived;
    if (dataChanges.sort_order !== undefined) updatePayload.sort_order = dataChanges.sort_order;

    const { error: updateError } = await supabase.from(REPOSITORY_TABLE).update(updatePayload).eq('id', productId);
    
    if (updateError) {
      console.error('Product record update failed:', updateError);
      synchronizeInventory(true); // Rollback on failure
    } else if (dataChanges.image) {
      synchronizeInventory(true); // Refresh for new asset URLs
    }
  }, [synchronizeInventory]);

  /**
   * uploadProductVisualAsset: Manages image processing and remote storage deployment.
   */
  const uploadProductVisualAsset = useCallback(async (productId: string, visualFile: File) => {
    try {
      const targetProduct = catalogProducts.find(p => p.id === productId);
      if (!targetProduct) throw new Error('Target product not found.');

      const { processDualQualityVisuals } = await import('../utils/image');
      const { hq: highQualityAsset, lq: previewAsset } = await processDualQualityVisuals(visualFile);

      // Storage Hygiene: Remove legacy assets to prevent orphaned files
      if (targetProduct.image) {
        try {
          const assetUrl = new URL(targetProduct.image);
          const fileName = assetUrl.pathname.split('/').pop();
          if (fileName) {
            await supabase.storage.from(TECH.storage.bucket).remove([
              `${TECH.storage.lqFolder}/${fileName}`, 
              `${TECH.storage.hqFolder}/${fileName}`
            ]);
          }
        } catch (hygieneError) {}
      }

      // SEO-Friendly Naming Pattern
      const turkishCharMap: any = { 'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','Ç':'C','Ğ':'G','İ':'I','Ö':'O','Ş':'S','Ü':'U' };
      const sanitizedName = (targetProduct.name)
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => turkishCharMap[char])
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .substring(0, TECH.products.maxFileNameLength);
      
      const uniqueSuffix = Math.random().toString(36).substring(2, 2 + TECH.products.uniqueIdSuffixLength);
      const storageFileName = `${sanitizedName}-${productId.substring(0, 4)}-${uniqueSuffix}.jpg`;

      const lqPath = `${TECH.storage.lqFolder}/${storageFileName}`;
      const hqPath = `${TECH.storage.hqFolder}/${storageFileName}`;

      // Parallel Upload Deployment
      const [lqUpload, hqUpload] = await Promise.all([
        supabase.storage.from(TECH.storage.bucket).upload(lqPath, previewAsset, { upsert: true, cacheControl: TECH.storage.cacheControl }),
        supabase.storage.from(TECH.storage.bucket).upload(hqPath, highQualityAsset, { upsert: true, cacheControl: TECH.storage.cacheControl })
      ]);

      if (lqUpload.error) throw lqUpload.error;
      if (hqUpload.error) throw hqUpload.error;

      const { data: { publicUrl } } = supabase.storage.from(TECH.storage.bucket).getPublicUrl(lqPath);
      const finalizedUrl = `${publicUrl}?t=${Date.now()}`;

      await modifyProductRecord(productId, { image: finalizedUrl });
      return finalizedUrl;

    } catch (deploymentError: any) {
      alert(LABELS.saveError);
      console.error('Visual asset deployment failed:', deploymentError);
      throw deploymentError;
    }
  }, [catalogProducts, modifyProductRecord]);

  /**
   * addNewProductRecord: Initializes a new product in the catalog.
   */
  const addNewProductRecord = useCallback(async (productData: Omit<Product, 'id' | 'is_archived'>, initialImage?: File) => {
    // Positioning Logic: Place new product at the end of its category
    const peerProducts = catalogProducts.filter(p => p.category === productData.category);
    const maxOrdinalPosition = peerProducts.length > 0 
      ? Math.max(...peerProducts.map(p => p.sort_order || 0)) 
      : 0;
    
    const { data: newRecord, error: insertError } = await supabase.from(REPOSITORY_TABLE).insert([{
      name: productData.name,
      category: productData.category,
      price: productData.price,
      description: productData.description,
      out_of_stock: !productData.inStock,
      is_archived: false,
      sort_order: maxOrdinalPosition + 1
    }]).select().single();

    if (newRecord && !insertError) {
      if (initialImage) await uploadProductVisualAsset(newRecord.id, initialImage);
      else synchronizeInventory(true);
    }
  }, [uploadProductVisualAsset, synchronizeInventory, catalogProducts]);

  /**
   * deleteProductRecord: Permanently removes a product and its associated assets.
   */
  const deleteProductRecord = useCallback(async (productId: string) => {
    if (!window.confirm(LABELS.deleteConfirm)) return;
    
    const targetProduct = catalogProducts.find(p => p.id === productId);
    setCatalogProducts(previous => previous.filter(p => p.id !== productId));
    
    const { error: deletionError } = await supabase.from(REPOSITORY_TABLE).delete().eq('id', productId);
    
    if (!deletionError && targetProduct?.image) {
      try {
        const assetUrl = new URL(targetProduct.image);
        const fileName = assetUrl.pathname.split('/').pop();
        if (fileName) {
          await supabase.storage.from(TECH.storage.bucket).remove([
            `${TECH.storage.lqFolder}/${fileName}`, 
            `${TECH.storage.hqFolder}/${fileName}`
          ]);
        }
      } catch (assetCleanupError) {}
      synchronizeInventory(true);
    } else if (deletionError) {
      synchronizeInventory(); // Revert UI if server deletion fails
    }
  }, [catalogProducts, synchronizeInventory]);

  /**
   * clearEntireInventory: Destructive action to wipe all products.
   */
  const clearEntireInventory = useCallback(async () => {
    if (!window.confirm(LABELS.adminActions.confirmDeleteAll)) return;
    await supabase.from(REPOSITORY_TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    synchronizeInventory();
  }, [synchronizeInventory]);

  /**
   * modifyCategorySequence: Reorders category presentation in the UI.
   */
  const modifyCategorySequence = useCallback((categoryName: string, targetPosition: number) => {
    const existingOrder = storeSettings.categoryOrder;
    const filteredCategories = existingOrder.filter(name => name !== categoryName);
    const finalizedSequence = [
      ...filteredCategories.slice(0, targetPosition - 1), 
      categoryName, 
      ...filteredCategories.slice(targetPosition - 1)
    ];
    updateStoreSetting('categoryOrder', finalizedSequence);
  }, [storeSettings.categoryOrder, updateStoreSetting]);

  /**
   * rebrandCategory: Renames a category across all associated products.
   */
  const rebrandCategory = useCallback(async (legacyName: string, updatedName: string) => {
    if (!updatedName || legacyName === updatedName) return;
    
    // UI Feedback: Instant name update
    setCatalogProducts(previous => previous.map(p => p.category === legacyName ? { ...p, category: updatedName } : p));
    
    const { error: updateError } = await supabase.from(REPOSITORY_TABLE).update({ category: updatedName }).eq('category', legacyName);
    
    if (!updateError) {
      const updatedOrderSequence = storeSettings.categoryOrder.map(name => name === legacyName ? updatedName : name);
      updateStoreSetting('categoryOrder', updatedOrderSequence);
      synchronizeInventory(true);
    }
  }, [storeSettings.categoryOrder, updateStoreSetting, synchronizeInventory]);

  /**
   * decommissionCategory: Moves all products from a category to a fallback general category.
   */
  const decommissionCategory = useCallback(async (targetCategory: string) => {
    const fallbackCategoryName = TECH.products.fallbackCategory;
    setCatalogProducts(previous => previous.map(p => p.category === targetCategory ? { ...p, category: fallbackCategoryName } : p));
    
    const { error: migrationError } = await supabase.from(REPOSITORY_TABLE).update({ category: fallbackCategoryName }).eq('category', targetCategory);
    
    if (!migrationError) {
      const truncatedSequence = storeSettings.categoryOrder.filter(name => name !== targetCategory);
      updateStoreSetting('categoryOrder', truncatedSequence);
      synchronizeInventory(true);
    }
  }, [storeSettings.categoryOrder, updateStoreSetting, synchronizeInventory]);

  /**
   * SEARCH & FILTER LOGIC: Memoized filtering for performance.
   */
  const filteredCatalog = useMemo(() => {
    const searchToken = currentSearchQuery.toLowerCase().trim();
    return catalogProducts.filter(product => {
      // Access Control: Customers cannot see archived items
      if (!isAdministrativeModeActive && product.is_archived) return false;
      
      const matchesSearch = !searchToken || 
        product.name.toLowerCase().includes(searchToken) || 
        (product.description || '').toLowerCase().includes(searchToken);
      
      const matchesCategory = activeFilterCategories.length === 0 || 
        activeFilterCategories.includes(product.category);
      
      return matchesSearch && matchesCategory;
    });
  }, [catalogProducts, currentSearchQuery, activeFilterCategories, isAdministrativeModeActive]);

  /**
   * CATEGORY ANALYTICS: Identifies all unique categories present in the catalog.
   */
  const discoveryCategories = useMemo(() => {
    const uniqueFound = [...new Set(catalogProducts.map(p => p.category).filter(Boolean))];
    return sortCategories(uniqueFound, storeSettings.categoryOrder);
  }, [catalogProducts, storeSettings.categoryOrder]);

  return {
    products: filteredCatalog,
    allProducts: catalogProducts,
    totalCount: filteredCatalog.length,
    existingCategories: discoveryCategories,
    categoryOrder: storeSettings.categoryOrder,
    loading: isInventoryLoading || isSettingsLoading,
    updateProduct: modifyProductRecord,
    deleteProduct: deleteProductRecord,
    deleteAllProducts: clearEntireInventory,
    addProduct: addNewProductRecord,
    reorderCategory: modifyCategorySequence,
    reorderProductsInCategory: (id: string, pos: number) => modifyProductRecord(id, { sort_order: pos }),
    renameCategory: rebrandCategory,
    removeCategoryFromProducts: decommissionCategory,
    uploadImage: uploadProductVisualAsset,
  };
}
