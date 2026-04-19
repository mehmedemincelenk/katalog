import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  sortCategories,
  LABELS,
  TECH,
} from '../data/config';
import { getActiveStoreSlug } from '../utils/store';
import { Product } from '../types';
import { CompanySettings } from './useSettings';
import { transformCurrencyStringToNumber, formatNumberToCurrency } from '../utils/price';
import { processDualQualityVisuals } from '../utils/image';

const REPOSITORY_TABLE = 'prods';


/**
 * USE PRODUCTS HOOK (INVENTORY & CATALOG ENGINE)
 * -----------------------------------------------------------
 * Manages product lifecycle, categorized display logic, and inventory synchronization.
 */
export function useProducts(
  currentSearchQuery = '',
  activeFilterCategories: string[] = [],
  isAdministrativeModeActive = false,
  storeSettings: CompanySettings,
  updateStoreSetting: (key: keyof CompanySettings, value: string | string[]) => Promise<void>
) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);

  /**
   * synchronizeInventory: Fetches all product records from Supabase repository.
   */
  const synchronizeInventory = useCallback(async (isSilent = false) => {
    const currentSlug = getActiveStoreSlug();

    if (currentSlug === 'main-site' || !storeSettings.id) {
      if (!isSilent) setIsInventoryLoading(false);
      return;
    }
    
    if (!isSilent) setIsInventoryLoading(true);
    
    const { data: repositoryData, error: fetchError } = await supabase
      .from(REPOSITORY_TABLE)
      .select('*')
      .eq('store_id', storeSettings.id)
      .order('sort_order', { ascending: true });
    
    if (fetchError) {
      console.error('Inventory synchronization failed:', fetchError);
    } else if (repositoryData) {
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
  }, [storeSettings.id]);

  useEffect(() => { synchronizeInventory(); }, [synchronizeInventory]);

  /**
   * modifyProductRecord: Updates specific product data with optimistic UI feedback.
   */
  const modifyProductRecord = useCallback(async (productId: string, dataChanges: Partial<Product>) => {
    // Optimistic UI Update (Skip for images as they involve storage latency)
    if (!dataChanges.image) {
      setCatalogProducts(previous => {
        const updated = previous.map(p => p.id === productId ? { ...p, ...dataChanges } : p);
        if (dataChanges.sort_order !== undefined) {
          return [...updated].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        }
        return updated;
      });
    }

    const updatePayload: Record<string, string | number | boolean | undefined> = {};
    if (dataChanges.name !== undefined) updatePayload.name = dataChanges.name;
    if (dataChanges.category !== undefined) updatePayload.category = dataChanges.category;
    if (dataChanges.price !== undefined) updatePayload.price = dataChanges.price;
    if (dataChanges.image !== undefined) updatePayload.image_url = dataChanges.image || undefined;
    if (dataChanges.description !== undefined) updatePayload.description = dataChanges.description;
    if (dataChanges.inStock !== undefined) updatePayload.out_of_stock = !dataChanges.inStock;
    if (dataChanges.is_archived !== undefined) updatePayload.is_archived = dataChanges.is_archived;
    if (dataChanges.sort_order !== undefined) updatePayload.sort_order = dataChanges.sort_order;

    const { error: updateError } = await supabase
      .from(REPOSITORY_TABLE)
      .update(updatePayload)
      .eq('id', productId)
      .eq('store_id', storeSettings.id);
    
    if (updateError) {
      console.error('❌ Ürün güncelleme hatası:', updateError);
      synchronizeInventory(true); // Rollback
    } else if (dataChanges.sort_order !== undefined || dataChanges.image) {
      synchronizeInventory(true);
    }
  }, [synchronizeInventory, storeSettings.id]);

  /**
   * removeProductVisual: Deletes associated visuals from storage tiers.
   */
  const removeProductVisual = useCallback(async (visualUrl: string) => {
    try {
      const assetUrl = new URL(visualUrl);
      const fileName = assetUrl.pathname.split('/').pop();
      if (fileName && !fileName.includes('placeholder')) {
        await supabase.storage.from(TECH.storage.bucket).remove([
          `${TECH.storage.lqFolder}/${fileName}`, 
          `${TECH.storage.hqFolder}/${fileName}`
        ]);
      }
    } catch (cleanupError) {
      console.error('Visual asset decommission failed:', cleanupError);
    }
  }, []);

  /**
   * uploadProductVisualAsset: Direct storage deployment with dual-quality processing.
   */
  const uploadProductVisualAsset = useCallback(async (productId: string, visualFile: File) => {
    const targetProduct = catalogProducts.find(p => p.id === productId);
    if (!targetProduct) return;

    try {
      const { hq: highQualityAsset, lq: previewAsset } = await processDualQualityVisuals(visualFile);

      // Storage Hygiene
      if (targetProduct.image) {
        await removeProductVisual(targetProduct.image);
      }

      // SEO Naming
      const turkishCharMap: Record<string, string> = { 'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','Ç':'C','Ğ':'G','İ':'I','Ö':'O','Ş':'S','Ü':'U' };
      const fileName = `${targetProduct.name.replace(/[çğıöşüÇĞİÖŞÜ]/g, (c: string) => turkishCharMap[c] || c).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').substring(0, 30)}-${productId.substring(0, 4)}-${Math.random().toString(36).substring(2, 7)}.jpg`;

      const lqPath = `${TECH.storage.lqFolder}/${fileName}`;
      const hqPath = `${TECH.storage.hqFolder}/${fileName}`;

      const [lqUp, hqUp] = await Promise.all([
        supabase.storage.from(TECH.storage.bucket).upload(lqPath, previewAsset, { upsert: true, cacheControl: TECH.storage.cacheControl }),
        supabase.storage.from(TECH.storage.bucket).upload(hqPath, highQualityAsset, { upsert: true, cacheControl: TECH.storage.cacheControl })
      ]);

      if (lqUp.error) throw lqUp.error;
      if (hqUp.error) throw hqUp.error;

      const { data: { publicUrl } } = supabase.storage.from(TECH.storage.bucket).getPublicUrl(lqPath);
      const finalizedUrl = `${publicUrl}?t=${Date.now()}`;
      
      await modifyProductRecord(productId, { image: finalizedUrl });
      return finalizedUrl;
    } catch (error) {
      console.error('Visual asset deployment failed:', error);
      alert(LABELS.saveError);
      throw error;
    }
  }, [catalogProducts, removeProductVisual, modifyProductRecord]);

  /**
   * addNewProductRecord: Initializes a new product in the catalog.
   */
  const addNewProductRecord = useCallback(async (productData: Omit<Product, 'id' | 'is_archived'>, initialImage?: File) => {
    const peerProducts = catalogProducts.filter(p => p.category === productData.category);
    const maxOrdinalPosition = peerProducts.length > 0 
      ? Math.max(...peerProducts.map(p => p.sort_order || 0)) 
      : 0;
    
    const { data: newRecord, error: insertError } = await supabase.from(REPOSITORY_TABLE).insert([{
      store_id: storeSettings.id,
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
  }, [uploadProductVisualAsset, synchronizeInventory, catalogProducts, storeSettings.id]);

  /**
   * deleteProductRecord: Permanently removes a product and associated assets.
   */
  const deleteProductRecord = useCallback(async (productId: string) => {
    if (!window.confirm(LABELS.deleteConfirm)) return;
    
    const targetProduct = catalogProducts.find(p => p.id === productId);
    setCatalogProducts(previous => previous.filter(p => p.id !== productId));
    
    const { error: deletionError } = await supabase
      .from(REPOSITORY_TABLE)
      .delete()
      .eq('id', productId)
      .eq('store_id', storeSettings.id);
    
    if (!deletionError && targetProduct?.image) {
      await removeProductVisual(targetProduct.image);
      synchronizeInventory(true);
    } else if (deletionError) {
      synchronizeInventory(); 
    }
  }, [catalogProducts, synchronizeInventory, storeSettings.id, removeProductVisual]);

  /**
   * reorderProductsInCategory: Stable sequence management.
   */
  const reorderProductsInCategory = useCallback(async (productId: string, targetPos: number) => {
    const targetProduct = catalogProducts.find(p => p.id === productId);
    if (!targetProduct) return;

    const category = targetProduct.category;
    const peerProducts = catalogProducts
      .filter(p => p.category === category)
      .sort((a, b) => ((a.sort_order || 0) - (b.sort_order || 0)) || a.id.localeCompare(b.id));

    const otherPeers = peerProducts.filter(p => p.id !== productId);
    const newPeersOrder = [
      ...otherPeers.slice(0, targetPos - 1),
      targetProduct,
      ...otherPeers.slice(targetPos - 1)
    ];

    const updates = newPeersOrder.map((p, index) => ({
      id: p.id,
      sort_order: index + 1
    }));

    setCatalogProducts(prev => {
      const updated = prev.map(p => {
        const up = updates.find(u => u.id === p.id);
        return up ? { ...p, sort_order: up.sort_order } : p;
      });
      return [...updated].sort((a, b) => ((a.sort_order || 0) - (b.sort_order || 0)) || a.id.localeCompare(b.id));
    });

    try {
      await Promise.all(updates.map(u => 
        supabase.from(REPOSITORY_TABLE).update({ sort_order: u.sort_order }).eq('id', u.id).eq('store_id', storeSettings.id)
      ));
    } catch (err) {
      console.error('❌ Sıralama işlemi başarısız:', err);
      synchronizeInventory();
    }
  }, [catalogProducts, synchronizeInventory, storeSettings.id]);

  /**
   * executeGranularBulkActions: Processes multiple specific product changes (price, deletion, archive, stock) in parallel.
   */
  const executeGranularBulkActions = useCallback(async (actions: { productId: string; newPrice?: number; delete?: boolean; inStock?: boolean; is_archived?: boolean }[]) => {
    if (actions.length === 0) return;

    try {
      setIsInventoryLoading(true);

      const priceUpdates = actions.filter(a => a.newPrice !== undefined);
      const deletions = actions.filter(a => a.delete === true);
      const stockUpdates = actions.filter(a => a.inStock !== undefined);
      const archiveUpdates = actions.filter(a => a.is_archived !== undefined);

      // Perform all updates and deletions in parallel batches
      await Promise.all([
        // Prices
        ...priceUpdates.map(u => 
          supabase.from(REPOSITORY_TABLE)
            .update({ price: formatNumberToCurrency(u.newPrice!) })
            .eq('id', u.productId)
            .eq('store_id', storeSettings.id)
        ),
        // Deletions
        ...deletions.map(d => 
          supabase.from(REPOSITORY_TABLE)
            .delete()
            .eq('id', d.productId)
            .eq('store_id', storeSettings.id)
        ),
        // Stock Status
        ...stockUpdates.map(s => 
          supabase.from(REPOSITORY_TABLE)
            .update({ out_of_stock: !s.inStock })
            .eq('id', s.productId)
            .eq('store_id', storeSettings.id)
        ),
        // Archive Status
        ...archiveUpdates.map(a => 
          supabase.from(REPOSITORY_TABLE)
            .update({ is_archived: a.is_archived })
            .eq('id', a.productId)
            .eq('store_id', storeSettings.id)
        )
      ]);

      await synchronizeInventory(true);
    } catch (err) {
      console.error('❌ Granüler toplu işlem hatası:', err);
      alert(LABELS.saveError);
      synchronizeInventory();
    } finally {
      setIsInventoryLoading(false);
    }
  }, [synchronizeInventory, storeSettings.id]);

  /**
   * bulkUpdatePrices: Batch arithmetic pricing updates.
   */
  const bulkUpdatePrices = useCallback(async (targetCategories: string[], amount: number, isPercentage: boolean, isIncrease: boolean) => {
    const productsToUpdate = catalogProducts.filter(p => targetCategories.length === 0 || targetCategories.includes(p.category));
    if (productsToUpdate.length === 0) return;

    const updates = productsToUpdate.map(product => {
      const currentPrice = transformCurrencyStringToNumber(product.price);
      let newPrice = currentPrice;

      if (isPercentage) {
        const adjustment = currentPrice * (amount / 100);
        newPrice = isIncrease ? currentPrice + adjustment : currentPrice - adjustment;
      } else {
        newPrice = isIncrease ? currentPrice + amount : currentPrice - amount;
      }

      if (newPrice < 0) newPrice = 0;

      return {
        id: product.id,
        price: formatNumberToCurrency(newPrice)
      };
    });

    try {
      setIsInventoryLoading(true);
      await Promise.all(updates.map(u => 
        supabase.from(REPOSITORY_TABLE).update({ price: u.price }).eq('id', u.id).eq('store_id', storeSettings.id)
      ));
      await synchronizeInventory(true);
    } catch (err) {
      console.error('❌ Toplu fiyat güncelleme hatası:', err);
      alert(LABELS.saveError);
      synchronizeInventory();
    } finally {
      setIsInventoryLoading(false);
    }
  }, [catalogProducts, synchronizeInventory, storeSettings.id]);

  /**
   * CATEGORY ANALYTICS & REBRANDING
   */
  const discoveryCategories = useMemo(() => {
    const foundInProducts = [...new Set(catalogProducts.map(p => p.category).filter(Boolean))];
    const consolidated = [...new Set([...storeSettings.categoryOrder, ...foundInProducts])];
    return sortCategories(consolidated, storeSettings.categoryOrder);
  }, [catalogProducts, storeSettings.categoryOrder]);

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

  const rebrandCategory = useCallback(async (legacyName: string, updatedName: string) => {
    if (!updatedName || legacyName === updatedName) return;
    
    if (storeSettings.categoryOrder.includes(updatedName)) {
      alert(`"${updatedName}" isminde bir reyon zaten mevcut.`);
      return;
    }
    setCatalogProducts(previous => previous.map(p => p.category === legacyName ? { ...p, category: updatedName } : p));
    const { error: updateError } = await supabase
      .from(REPOSITORY_TABLE)
      .update({ category: updatedName })
      .eq('category', legacyName)
      .eq('store_id', storeSettings.id);

    if (!updateError) {
      const updatedOrderSequence = storeSettings.categoryOrder.map(name => name === legacyName ? updatedName : name);
      updateStoreSetting('categoryOrder', updatedOrderSequence);
      synchronizeInventory(true);
    }
  }, [storeSettings.categoryOrder, updateStoreSetting, synchronizeInventory, storeSettings.id]);

  const decommissionCategory = useCallback(async (targetCategory: string) => {
    const fallbackCategoryName = TECH.products.fallbackCategory;
    setCatalogProducts(previous => previous.map(p => p.category === targetCategory ? { ...p, category: fallbackCategoryName, is_archived: true } : p));
    const { error: migrationError } = await supabase
      .from(REPOSITORY_TABLE)
      .update({ category: fallbackCategoryName, is_archived: true })
      .eq('category', targetCategory)
      .eq('store_id', storeSettings.id);

    if (!migrationError) {
      const truncatedSequence = storeSettings.categoryOrder.filter(name => name !== targetCategory);
      updateStoreSetting('categoryOrder', truncatedSequence);
      synchronizeInventory(true);
    }
  }, [storeSettings.categoryOrder, updateStoreSetting, synchronizeInventory, storeSettings.id]);

  const addCategory = useCallback((newName: string) => {
    if (!newName || storeSettings.categoryOrder.includes(newName)) return;
    updateStoreSetting('categoryOrder', [...storeSettings.categoryOrder, newName]);
  }, [storeSettings.categoryOrder, updateStoreSetting]);

  const filteredCatalog = useMemo(() => {
    const searchToken = currentSearchQuery.toLowerCase().trim();
    return catalogProducts.filter(product => {
      if (!isAdministrativeModeActive && product.is_archived) return false;
      const matchesSearch = !searchToken || 
        product.name.toLowerCase().includes(searchToken) || 
        (product.description || '').toLowerCase().includes(searchToken);
      const matchesCategory = activeFilterCategories.length === 0 || 
        activeFilterCategories.includes(product.category);
      return matchesSearch && matchesCategory;
    });
  }, [catalogProducts, currentSearchQuery, activeFilterCategories, isAdministrativeModeActive]);

  return {
    products: filteredCatalog,
    allProducts: catalogProducts,
    totalCount: filteredCatalog.length,
    existingCategories: discoveryCategories,
    categoryOrder: storeSettings.categoryOrder,
    loading: isInventoryLoading,
    updateProduct: modifyProductRecord,
    deleteProduct: deleteProductRecord,
    addProduct: addNewProductRecord,
    reorderCategory: modifyCategorySequence,
    reorderProductsInCategory: reorderProductsInCategory,
    renameCategory: rebrandCategory,
    removeCategoryFromProducts: decommissionCategory,
    uploadImage: uploadProductVisualAsset,
    addCategory: addCategory,
    bulkUpdatePrices,
    executeGranularBulkActions,
  };
}
