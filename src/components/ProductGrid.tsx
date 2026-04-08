import { GRID, sortCategories } from '../data/config';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categoryOrder: string[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderUpdate: (productId: string, newPosition: number) => void;
  activeDiscount?: { code: string; rate: number; category?: string } | null;
  visibleCategoryLimit?: number;
  search?: string;
  activeCategories?: string[];
  onAddClick?: () => void;
}

export default function ProductGrid({
  products,
  categoryOrder,
  isAdmin,
  onDelete,
  onUpdate,
  onOrderUpdate,
  activeDiscount,
  visibleCategoryLimit = 999,
  search = '',
  activeCategories = [],
  onAddClick,
}: ProductGridProps) {
  if (products.length === 0 && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-400">
        <span className="text-5xl mb-3">🔍</span>
        <p className="text-sm font-medium">Ürün bulunamadı.</p>
      </div>
    );
  }

  // Gruplama
  const groupedProducts = products.reduce((acc: Record<string, Product[]>, product) => {
    const catName = product.category || 'KATEGORİSİZ / DİĞER';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(product);
    return acc;
  }, {});

  const sortedCategories = sortCategories(Object.keys(groupedProducts), categoryOrder);

  // Limitleme: Sadece ilk N kategoriyi göster (Admin değilse VE arama/filtreleme yoksa)
  const isFiltering = search.trim() !== '' || activeCategories.length > 0;
  const displayedCategories = (isAdmin || isFiltering) 
    ? sortedCategories 
    : sortedCategories.slice(0, visibleCategoryLimit);

  // Sayısal Sıralama Değiştirme Mantığı (Tüm mantık artık Hook içinde güvenle yapılıyor)
  const handleOrderChange = (productId: string, newPosition: number) => {
    onOrderUpdate(productId, newPosition);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Admin Yeni Ürün Ekleme Çubuğu */}
      {isAdmin && (
        <button 
          onClick={onAddClick}
          className="w-full mb-8 py-4 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center gap-3 text-stone-400 hover:border-stone-900 hover:text-stone-900 hover:bg-stone-50 transition-all active:scale-[0.99] group"
        >
          <span className="text-2xl font-light group-hover:scale-125 transition-transform">+</span>
          <span className="text-xs font-bold uppercase tracking-widest">Yeni Ürün Yükle</span>
        </button>
      )}

      {displayedCategories.map((catName) => (
        <div key={catName} className="flex flex-col mb-12">
          <div className="flex items-center gap-3 mb-4 px-1">
            <h2 className="text-[13px] font-black text-stone-900 tracking-tighter uppercase">{catName}</h2>
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-[10px] font-bold text-stone-400">{groupedProducts[catName].length} ÜRÜN</span>
          </div>
          
          <div className={`grid ${GRID.colsClass} ${GRID.gapClass}`}>
            {groupedProducts[catName].map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={sortedCategories}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onOrderChange={handleOrderChange}
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
