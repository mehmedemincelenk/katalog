import { useMemo, memo } from 'react';
import { UI, LABELS, sortCategories } from '../data/config';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ActiveDiscount } from '../hooks/useDiscount';

/**
 * PRODUCT GRID BİLEŞENİ (MAĞAZA MİMARİSİ)
 * -------------------------------------
 * Müşteriye ürünleri reyon düzeninde sunan ana sergi alanıdır.
 */

interface ProductGridProps {
  products: Product[];
  categoryOrder: string[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderUpdate: (id: string, newPosition: number) => void;
  activeDiscount?: ActiveDiscount | null;
  visibleCategoryLimit: number;
  search: string;
  activeCategories: string[];
  onAddClick: () => void;
}

export default function ProductGrid({
  products, categoryOrder, isAdmin, onDelete, onUpdate, onOrderUpdate,
  activeDiscount, visibleCategoryLimit, search, activeCategories, onAddClick
}: ProductGridProps) {
  
  const { groupedProducts, sortedCategories } = useMemo(() => {
    const grouped = products.reduce((acc: Record<string, Product[]>, product) => {
      const catName = product.category || 'KATEGORİSİZ / DİĞER';
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(product);
      return acc;
    }, {});

    const sorted = sortCategories(Object.keys(grouped), categoryOrder);
    return { groupedProducts: grouped, sortedCategories: sorted };
  }, [products, categoryOrder]);

  if (products.length === 0 && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-400 animate-in fade-in duration-500">
        <span className="text-5xl mb-3">🔍</span>
        <p className="text-sm font-medium italic">{LABELS.noProductsFound}</p>
      </div>
    );
  }

  const isFiltering = search.trim() !== '' || activeCategories.length > 0;
  const displayedCategories = isFiltering ? sortedCategories : sortedCategories.slice(0, visibleCategoryLimit);

  return (
    <div className="w-full flex flex-col min-h-[400px]">
      
      {/* Admin için boş mağaza uyarısı */}
      {products.length === 0 && isAdmin && (
        <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-xl mb-8">
          <p className="text-stone-400 text-sm italic">{LABELS.noProductsAdmin}</p>
        </div>
      )}

      {/* REYONLAR (Kategoriler) DÖNGÜSÜ */}
      {displayedCategories.map((catName) => (
        <div key={catName} className={`flex flex-col ${UI.grid.sectionMargin}`}>
          {/* Reyon Başlık Bandı */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <h2 className="text-[13px] font-black text-stone-900 tracking-tighter uppercase">{catName}</h2>
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-[10px] font-bold text-stone-400">
              {groupedProducts[catName].length} {LABELS.productCountSuffix}
            </span>
          </div>
          
          {/* Ürün Kartları Izgarası */}
          <div className={`grid ${UI.grid.cols} ${UI.grid.gap}`}>
            {groupedProducts[catName].map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={sortedCategories}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onOrderChange={onOrderUpdate}
                orderIndex={idx + 1}
                itemsInCategory={groupedProducts[catName].length}
                activeDiscount={activeDiscount}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
