import { useMemo, memo } from 'react';
import { THEME, LABELS, sortCategories, TECH } from '../data/config';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ActiveDiscount } from '../hooks/useDiscount';

/**
 * PRODUCT GRID COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Main catalog display area. Organizes products into styled category sections.
 */

interface ProductGridProps {
  products: Product[];
  categoryOrder: string[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderUpdate: (id: string, newPosition: number) => void;
  onImageUpload?: (id: string, file: File) => Promise<void>;
  activeDiscount?: ActiveDiscount | null;
  visibleCategoryLimit: number;
  search: string;
  activeCategories: string[];
  onAddClick?: () => void;
}

const ProductGrid = memo(({
  products = [], 
  categoryOrder = [], 
  isAdmin, 
  onDelete, 
  onUpdate, 
  onOrderUpdate, 
  onImageUpload,
  activeDiscount, 
  visibleCategoryLimit,
  search,
  activeCategories,
  onAddClick
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
    
    // Filter by search or category filter if active
    let filtered = allCategories;
    if (activeCategories.length > 0) {
      filtered = allCategories.filter(cat => activeCategories.includes(cat));
    } else if (search) {
      filtered = existingInProducts;
    }

    return sortCategories(filtered, categoryOrder);
  }, [groupedProducts, categoryOrder, search, activeCategories]);

  // Limit visible categories for smooth initial load
  const visibleCategories = displayCategories.slice(0, visibleCategoryLimit);

  if (products.length === 0 && !isAdmin) {
    return (
      <div className={theme.emptyState.wrapper}>
        <div className={theme.emptyState.iconSize}>{THEME.icons.search}</div>
        <p className={theme.emptyState.text}>{LABELS.noProductsFound}</p>
      </div>
    );
  }

  if (products.length === 0 && isAdmin) {
    return (
      <div className={theme.emptyState.adminWrapper}>
        <p className="text-stone-500 mb-6 font-medium">{LABELS.noProductsAdmin}</p>
        <button 
          onClick={onAddClick}
          className="bg-stone-900 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
        >
          {LABELS.newProductBtn}
        </button>
      </div>
    );
  }

  return (
    <div className={theme.layout}>
      {visibleCategories.map((category) => {
        const categoryProducts = groupedProducts[category] || [];
        if (categoryProducts.length === 0 && !isAdmin) return null;

        return (
          <section key={category} className={theme.sectionSpacing}>
            <div className={theme.header.wrapper}>
              <h2 className={theme.header.title}>{category}</h2>
              <div className={theme.header.line}></div>
              <span className={theme.header.count}>
                {categoryProducts.length} {LABELS.productCountSuffix}
              </span>
            </div>

            <div className={`${theme.cols} ${theme.gap}`}>
              {categoryProducts.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  categories={categoryOrder}
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onOrderChange={onOrderUpdate}
                  onImageUpload={onImageUpload}
                  orderIndex={index + 1}
                  itemsInCategory={categoryProducts.length}
                  activeDiscount={activeDiscount}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
});

export default ProductGrid;
