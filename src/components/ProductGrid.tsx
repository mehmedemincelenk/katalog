import { useMemo } from 'react';
import { UI, LABELS, sortCategories } from '../data/config';
import { Product } from '../types';
import ProductCard from './ProductCard';

/**
 * PRODUCT GRID BİLEŞENİ (MAĞAZA MİMARİSİ)
 * -------------------------------------
 * Bir kurucu olarak bu bileşen senin "Dijital Reyon Yönetim" sistemindir.
 * 
 * 1. Reyonlaştırma: Ürünleri kategorilere göre otomatik gruplayarak müşterinin kafasının karışmasını önler.
 * 2. Performans (Lazy Load): "Daha Fazla Göster" mantığı ile sayfanın anında açılmasını sağlar.
 * 3. Dinamik Yapı: Sheets'e yeni bir ürün eklediğinde, eğer kategorisi yeniyse burada otomatik olarak yeni bir reyon açılır.
 * 4. Admin Ergonomisi: "Yeni Ürün Yükle" butonu ile mağazanı her an güncel tutmanı sağlar.
 */

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
  products, categoryOrder, isAdmin, onDelete, onUpdate, onOrderUpdate,
  activeDiscount, visibleCategoryLimit = 999, search = '', activeCategories = [], onAddClick,
}: ProductGridProps) {
  
  /**
   * GRUPLAMA MANTIĞI (TEKNİK):
   * Tüm ürün listesini tek tek gezer ve kategori isimlerine göre paketler oluşturur.
   * Sonuç: { 'PEÇETE': [ürün1, ürün2], 'KÖPÜK': [ürün3] }
   */
  const { groupedProducts, sortedCategories } = useMemo(() => {
    const grouped = products.reduce((acc: Record<string, Product[]>, product) => {
      const catName = product.category || 'KATEGORİSİZ / DİĞER';
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(product);
      return acc;
    }, {});

    // Reyonların sayfa üzerindeki dikey sırasını 'config.ts'deki kurala göre belirler.
    const sorted = sortCategories(Object.keys(grouped), categoryOrder);
    return { groupedProducts: grouped, sortedCategories: sorted };
  }, [products, categoryOrder]);

  // Boş Sonuç Ekranı (Kullanıcı için)
  if (products.length === 0 && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-400 animate-in fade-in duration-500">
        <span className="text-5xl mb-3">🔍</span>
        <p className="text-sm font-medium italic">{LABELS.noProductsFound}</p>
      </div>
    );
  }

  // LİMİTLEME: Kullanıcıyı boğmamak için reyonları azar azar açarız (Arama yapılmıyorsa).
  const isFiltering = search.trim() !== '' || activeCategories.length > 0;
  const displayedCategories = isFiltering ? sortedCategories : sortedCategories.slice(0, visibleCategoryLimit);

  return (
    <div className="w-full flex flex-col min-h-[400px]">
      
      {/* ADMİN: Yeni Ürün Ekleme Paneli */}
      {isAdmin && (
        <button 
          onClick={onAddClick}
          className="w-full mb-8 py-4 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center gap-3 text-stone-400 hover:border-stone-900 hover:text-stone-900 hover:bg-stone-50 transition-all active:scale-[0.99] group shadow-sm"
        >
          <span className="text-2xl font-light group-hover:scale-125 transition-transform">+</span>
          <span className="text-xs font-bold uppercase tracking-widest">{LABELS.newProductBtn}</span>
        </button>
      )}

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
