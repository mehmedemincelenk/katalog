import { useMemo, memo } from 'react';
import { UI, LABELS, sortCategories } from '../data/config';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { CompanySettings } from '../hooks/useSettings';
import { ActiveDiscount } from '../hooks/useDiscount';

/**
 * PRODUCT GRID BİLEŞENİ (MAĞAZA MİMARİSİ)
 * -------------------------------------
 * Bir kurucu olarak bu bileşen senin "Dijital Reyon Yönetim" sistemindir.
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
  isSelectMode?: boolean;
  selectedIds?: Set<string>;
  onSelectToggle?: (id: string) => void;
  // Dinamik Ayarlar ve Toplu İşlemler İçin Eklenenler
  settings?: CompanySettings;
  updateSetting?: (key: keyof CompanySettings, value: string) => void;
  toggleSelectMode?: () => void;
}

/**
 * AdminActionGrid: Yönetim butonlarını "Yeni Ürün Ekle" tarzında bir ızgara olarak sunar.
 */
const AdminActionGrid = memo(({ 
  settings, updateSetting, onAddClick, isSelectMode, toggleSelectMode 
}: { 
  settings: CompanySettings, updateSetting: (key: keyof CompanySettings, value: string) => void, 
  onAddClick: () => void, isSelectMode: boolean, toggleSelectMode: () => void 
}) => {
  const promptUpdate = (key: keyof CompanySettings, title: string, currentValue: string) => {
    const newVal = window.prompt(`${title} için yeni değer girin:`, currentValue);
    if (newVal !== null && newVal.trim() !== '') {
      updateSetting(key, newVal.trim());
    }
  };

  const btnClass = "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-stone-300 rounded-xl transition-all active:scale-[0.98] hover:border-stone-900 hover:text-stone-900 hover:bg-stone-50 group shadow-sm bg-white";
  const iconClass = "text-2xl group-hover:scale-110 transition-transform";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-stone-900";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
      <button onClick={() => promptUpdate('whatsapp', 'WhatsApp', settings.whatsapp)} className={btnClass}>
        <span className={iconClass}>💬</span>
        <span className={labelClass}>WhatsApp</span>
      </button>
      <button onClick={() => promptUpdate('address', 'Adres', settings.address)} className={btnClass}>
        <span className={iconClass}>📍</span>
        <span className={labelClass}>Adres</span>
      </button>
      <button onClick={() => promptUpdate('instagram', 'Instagram', settings.instagram)} className={btnClass}>
        <span className={iconClass}>📸</span>
        <span className={labelClass}>Instagram</span>
      </button>
      <button onClick={() => promptUpdate('title', 'Başlık', settings.title)} className={btnClass}>
        <span className={iconClass}>🏷️</span>
        <span className={labelClass}>Başlık</span>
      </button>
      <button onClick={() => promptUpdate('subtitle', 'Alt Başlık', settings.subtitle)} className={btnClass}>
        <span className={iconClass}>👤</span>
        <span className={labelClass}>Alt Başlık</span>
      </button>
      <button onClick={onAddClick} className={`${btnClass} border-stone-900 bg-stone-50`}>
        <span className={`${iconClass} font-light`}>+</span>
        <span className={`${labelClass} text-stone-900`}>{LABELS.newProductBtn}</span>
      </button>
      <button onClick={toggleSelectMode} className={`${btnClass} ${isSelectMode ? 'border-kraft-600 bg-kraft-50' : ''}`}>
        <span className={iconClass}>{isSelectMode ? '✕' : '✅'}</span>
        <span className={labelClass}>{isSelectMode ? 'Kapat' : 'Seç'}</span>
      </button>
    </div>
  );
});

export default function ProductGrid({
  products, categoryOrder, isAdmin, onDelete, onUpdate, onOrderUpdate,
  activeDiscount, visibleCategoryLimit, search, activeCategories, onAddClick,
  isSelectMode = false, selectedIds, onSelectToggle,
  settings, updateSetting, toggleSelectMode
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
      
      {/* ADMİN: Yönetim Izgarası (Yeni Stil) */}
      {isAdmin && settings && updateSetting && toggleSelectMode && (
        <AdminActionGrid 
          settings={settings} 
          updateSetting={updateSetting} 
          onAddClick={onAddClick}
          isSelectMode={isSelectMode}
          toggleSelectMode={toggleSelectMode}
        />
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
                isSelectMode={isSelectMode}
                isSelected={selectedIds?.has(product.id)}
                onSelectToggle={() => onSelectToggle?.(product.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
