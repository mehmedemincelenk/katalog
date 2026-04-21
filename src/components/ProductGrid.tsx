// FILE: src/components/ProductGrid.tsx
// ROLE: Renders the entire catalog categorized by sections, including handling empty states and "load more" logic
// READS FROM: src/data/config, src/types
// USED BY: App.tsx

import { useMemo, memo } from 'react';
import { THEME, LABELS, sortCategories, TECH } from '../data/config';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ActiveDiscount } from '../hooks/useDiscount';
import { Plus } from 'lucide-react';

/**
 * PRODUCT GRID COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Main catalog display area. Organizes products into styled category sections.
 */

interface ProductGridProps {
  products: Product[];
  categoryOrder: string[];
  isAdmin: boolean;
  isInlineEnabled: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderUpdate: (id: string, newPosition: number) => void;
  onOrderChange?: (id: string, newPosition: number) => void;
  onImageUpload?: (id: string, file: File) => Promise<string | undefined>;
  activeDiscount?: ActiveDiscount | null;
  visibleCategoryLimit: number;
  onLoadMore?: () => void;
  activeCategories: string[];
  onAddClick?: () => void;
  activeAdminProductId?: string | null;
  setActiveAdminProductId?: (id: string | null) => void;
  showPrice?: boolean;
}

// ARCHITECTURE: ProductGrid
// PURPOSE: Groups the flat product array into categories based on global configuration and renders `ProductCard` instances per category
// DEPENDENCIES: ProductCard, sortCategories, THEME.grid
// CONSUMERS: App layout layer
const ProductGrid = memo(({
  products = [], 
  categoryOrder = [], 
  isAdmin, 
  isInlineEnabled,
  onDelete, 
  onUpdate, 
  onOrderUpdate, 
  onImageUpload,
  activeDiscount, 
  visibleCategoryLimit,
  onLoadMore,
  activeCategories,
  onAddClick,
  activeAdminProductId,
  setActiveAdminProductId,
  showPrice = true
}: ProductGridProps) => {
  const theme = THEME.productGrid;

  // GRID ANALYTICS: Group products by their designated reyon (category)
  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.category || TECH.products.fallbackCategory;
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  // SORTING LOGIC: Determine which categories to show and in what order
  const displayCategories = useMemo(() => {
    const existingInProducts = Object.keys(groupedProducts);
    const allCategories = [...new Set([...categoryOrder, ...existingInProducts])];

    // Filter by category filter if active
    let filtered = allCategories;
    if (activeCategories.length > 0) {
      filtered = allCategories.filter(cat => activeCategories.includes(cat));
    }

    const sorted = sortCategories(filtered, categoryOrder);

    // In admin mode, we show all categories
    if (isAdmin) return sorted;

    // In user mode, we show:
    // 1. Categories that have products
    // 2. OR categories that are explicitly selected (even if empty, to show empty state)
    return sorted.filter(cat => (groupedProducts[cat] || []).length > 0 || activeCategories.includes(cat));
  }, [groupedProducts, categoryOrder, activeCategories, isAdmin]);

  // Limit visible categories for smooth initial load
  const visibleCategories = displayCategories.slice(0, visibleCategoryLimit);

  // LCP Optimization
  let priorityCounter = 0;

  // 1. GLOBAL SEARCH EMPTY STATE (Positioned higher for mobile keyboard)
  if (displayCategories.length === 0 && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-start min-h-[60vh] pt-20 w-full text-center animate-in fade-in duration-700">
        <div className="w-16 h-16 mb-6 opacity-20 text-stone-400">
          {THEME.icons.search}
        </div>
        <p className={`${THEME.font.base} text-stone-400 italic px-8`}>
          {LABELS.noProductsFound}
        </p>
      </div>
    );
  }

  return (
    <div className={theme.layout}>
      {visibleCategories.map((category) => {
        const categoryProducts = groupedProducts[category] || [];

        return (
          <section key={category} className={theme.sectionSpacing}>
            <div className={theme.header.wrapper}>
              <h2 className={theme.header.title}>{category}</h2>
              <div className={theme.header.line}></div>
              <span className={theme.header.count}>
                {categoryProducts.length} {LABELS.productCountSuffix}
              </span>
            </div>

            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-4 sm:gap-x-6 sm:gap-y-10">
                {categoryProducts.map((product, index) => {
                  const isPriority = priorityCounter < 4;
                  priorityCounter++;
                  return (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      categories={categoryOrder}
                      isAdmin={isAdmin}
                      isInlineEnabled={isInlineEnabled}
                      showPrice={showPrice}
                      onDelete={onDelete}
                      onUpdate={onUpdate}
                      onOrderChange={onOrderUpdate}
                      onImageUpload={onImageUpload}
                      orderIndex={index + 1}
                      itemsInCategory={categoryProducts.length}
                      activeDiscount={activeDiscount}
                      isPriority={isPriority}
                      activeAdminProductId={activeAdminProductId}
                      setActiveAdminProductId={setActiveAdminProductId}
                    />
                  );
                })}
              </div>
            ) : (
              /* CATEGORY-SPECIFIC EMPTY STATE */
              <div className="py-16 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center bg-stone-50/30">
                <p className="text-stone-400 text-xs font-medium italic mb-4">
                  {isAdmin ? "Bu reyon henüz boş." : "Bu reyonda henüz ürün bulunmuyor."}
                </p>
                {isAdmin && (
                  <button 
                    onClick={onAddClick}
                    className="bg-stone-900/5 text-stone-900 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all border border-stone-200 admin-fab"
                  >
                    + BU REYONA ÜRÜN EKLE
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}

      {/* DIAMOND LOAD MORE BUTTON */}
      {onLoadMore && displayCategories.length > visibleCategoryLimit && (
        <div className="flex flex-col items-center justify-center pt-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <button 
            onClick={onLoadMore}
            className="group relative flex flex-col items-center gap-3 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-stone-900 group-hover:border-stone-900 transition-all duration-300">
              <Plus className="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-stone-400 uppercase group-hover:text-stone-900 transition-colors">
              {LABELS.loadMoreBtn}
            </span>
          </button>
        </div>
      )}
    </div>
  );
});

export default ProductGrid;