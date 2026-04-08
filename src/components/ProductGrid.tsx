import { GRID, sortCategories } from '../data/config';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categoryOrder: string[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderUpdate: (newOrder: Product[]) => void;
  activeDiscount?: { code: string; rate: number; category?: string } | null;
  visibleCategoryLimit?: number;
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
}: ProductGridProps) {
  if (products.length === 0) {
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
  
  // Limitleme: Sadece ilk N kategoriyi göster (Admin değilse)
  const displayedCategories = sortedCategories.slice(0, visibleCategoryLimit);

  // Sayısal Sıralama Değiştirme Mantığı
  const handleOrderChange = (productId: string, newPosition: number) => {
    const productToMove = products.find(p => p.id === productId);
    if (!productToMove) return;

    const categoryName = productToMove.category || 'KATEGORİSİZ / DİĞER';
    const categoryProducts = products.filter(p => (p.category || 'KATEGORİSİZ / DİĞER') === categoryName);
    
    const oldGlobalIdx = products.findIndex(p => p.id === productId);
    const targetProductInCat = categoryProducts[newPosition - 1];
    const newGlobalIdx = products.findIndex(p => p.id === targetProductInCat.id);

    if (oldGlobalIdx !== -1 && newGlobalIdx !== -1) {
      const newProducts = [...products];
      newProducts.splice(oldGlobalIdx, 1);
      newProducts.splice(newGlobalIdx, 0, productToMove);
      onOrderUpdate(newProducts);
    }
  };

  return (
    <div className="w-full flex flex-col">
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
