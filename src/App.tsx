import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AddProductModal from './components/AddProductModal';
import BulkActionsPanel from './components/BulkActionsPanel';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';
import { useDiscount } from './hooks/useDiscount';
import { useSettings } from './hooks/useSettings';
import { UI, LABELS } from './data/config';
import { Product } from './types';

/**
 * APP BİLEŞENİ (STRATEJİK ANALİZ)
 * ----------------------------
 * Bir kurucu olarak bu dosya senin "Genel Müdürlüğündür".
 */
export default function App() {
  const { isAdmin, handleLogoClick, logout } = useAdminMode();
  const { activeDiscount, applyCode, error: discountError } = useDiscount();
  const { settings, updateSetting, loading: settingsLoading } = useSettings(isAdmin);

  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    products, categoryOrder, loading, addProduct, deleteProduct, updateProduct,
    renameCategory, removeCategoryFromProducts, existingCategories, reorderCategory, reorderProductsInCategory,
    deleteAllProducts, bulkUpdate, bulkDelete
  } = useProducts(search, activeCategories, isAdmin);
  
  const [visibleCategoryLimit, setVisibleCategoryLimit] = useState(UI.category.initialVisible);

  const toggleCategory = (cat: string) => {
    if (cat === LABELS.filter.allCategories) {
      setActiveCategories([]);
    } else {
      setActiveCategories((prev) =>
        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      );
    }
  };

  // APPLE STANDARD MOBİL DÜZENLEME (Tıklama Yutucu)
  // Kullanıcı bir yeri düzenlerken (klavye açıkken) dışarıdaki bir butona yanlışlıkla basmasını engeller.
  useEffect(() => {
    if (!isAdmin) return;
    const handlePointerDown = (e: PointerEvent) => {
      const active = document.activeElement;
      // Eğer tıklanan eleman aktif olan düzenleme alanı değilse ve bir düzenleme alanı aktifse
      if (active && active.hasAttribute('contenteditable') && active !== e.target) {
        e.preventDefault(); // Butonun tıklanmasını engelle
        (active as HTMLElement).blur(); // Sadece klavyeyi kapat
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [isAdmin]);

  // Çoklu Seçim Modu İşlemleri
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTargetIds = () => {
    const targets = new Set<string>();
    // Eğer kategori seçiliyse, O kategorilerdeki ürünleri de hedeflere ekle
    if (activeCategories.length > 0) {
      products.forEach(p => {
        if (activeCategories.includes(p.category)) targets.add(p.id);
      });
    }
    // El ile seçilen kartları da ekle
    selectedIds.forEach(id => targets.add(id));
    return Array.from(targets);
  };

  const handleBulkDelete = () => {
    const targets = getTargetIds();
    if (targets.length === 0) return alert('Seçili ürün yok.');
    bulkDelete(targets);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleBulkArchive = () => {
    const targets = getTargetIds();
    if (targets.length === 0) return alert('Seçili ürün yok.');
    // Varsayılan olarak hepsini arşivle veya tersine çevir. Basitçe arşivle (is_archived: true)
    const updates = targets.map(id => ({ id, changes: { is_archived: true } }));
    bulkUpdate(updates);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleBulkStock = () => {
    const targets = getTargetIds();
    if (targets.length === 0) return alert('Seçili ürün yok.');
    // Hepsini Tükendi yap (inStock: false) veya tam tersi. Mantıken durumu tersine çeviremeyiz çünkü farklı statüde ürünler olabilir. 
    const updates = targets.map(id => ({ id, changes: { inStock: true } }));
    bulkUpdate(updates);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleBulkCategory = () => {
    const targets = getTargetIds();
    if (targets.length === 0) return alert('Seçili ürün yok.');
    const cat = window.prompt(`Seçili ${targets.length} ürün için YENİ KATEGORİ yazın:`);
    if (!cat?.trim()) return;
    const updates = targets.map(id => ({ id, changes: { category: cat.trim() } }));
    bulkUpdate(updates);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleBulkName = () => {
    const targets = getTargetIds();
    if (targets.length === 0) return alert('Seçili ürün yok.');
    const option = window.prompt(`Seçili ${targets.length} ürünün ismine metin ekleyin.\nFormat: [BAŞA VEYA SONA]::[METİN]\nÖrn:\nSONA:: (Yeni)\nBAŞA::İndirimli `);
    if (!option || !option.includes('::')) return;
    const [pos, text] = option.split('::');
    
    const updates = targets.map(id => {
      const p = products.find(x => x.id === id);
      if (!p) return null;
      let newName = p.name;
      if (pos.trim().toUpperCase() === 'BAŞA') newName = text + newName;
      else if (pos.trim().toUpperCase() === 'SONA') newName = newName + text;
      return { id, changes: { name: newName } };
    }).filter(Boolean) as { id: string; changes: Partial<Product> }[];
    
    bulkUpdate(updates);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleBulkPrice = () => {
    const targets = getTargetIds();
    if (targets.length === 0) return alert('Seçili ürün yok.');
    const option = window.prompt(`Seçili ${targets.length} ürünün fiyatını değiştirin.\nÖrn: +10 (10 TL artırır), -5 (5 TL azaltır), %10 (Yüzde 10 artırır), -%20 (Yüzde 20 azaltır). Sadece sayı girerseniz o fiyatla eşitler.`);
    if (!option?.trim()) return;
    
    const val = option.trim();
    const isPercent = val.includes('%');
    const isPlus = val.startsWith('+');
    const isMinus = val.startsWith('-');
    const numericVal = parseFloat(val.replace(/[^0-9.]/g, ''));
    
    if (isNaN(numericVal)) return;

    const updates = targets.map(id => {
      const p = products.find(x => x.id === id);
      if (!p) return null;
      let currentPrice = parseFloat(p.price.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
      let newPrice = currentPrice;
      
      if (isPercent) {
        const diff = currentPrice * (numericVal / 100);
        if (isPlus) newPrice += diff;
        else if (isMinus) newPrice -= diff;
      } else {
        if (isPlus) newPrice += numericVal;
        else if (isMinus) newPrice -= numericVal;
        else newPrice = numericVal; // Sabit fiyat
      }
      
      return { id, changes: { price: newPrice.toFixed(2).replace('.', ',') + ' ₺' } };
    }).filter(Boolean) as { id: string; changes: Partial<Product> }[];
    
    bulkUpdate(updates);
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${UI.layout.bodyBg}`}>
      <Navbar settings={settings} />
      
      <main className="flex-grow">
        <HeroCarousel isAdmin={isAdmin} />
        
        <SearchFilter
          products={products} categoryOrder={categoryOrder} onCategoryOrderChange={reorderCategory}
          search={search} onSearchChange={setSearch} activeCategories={activeCategories}
          onCategoryToggle={toggleCategory} isAdmin={isAdmin}
          renameCategory={renameCategory} removeCategoryFromProducts={removeCategoryFromProducts}
        />

        <div className={UI.layout.container}>
          
          <ProductGrid
            products={products} categoryOrder={categoryOrder} isAdmin={isAdmin}
            onDelete={deleteProduct} onUpdate={updateProduct} onOrderUpdate={reorderProductsInCategory}
            activeDiscount={activeDiscount} 
            visibleCategoryLimit={isAdmin ? UI.layout.adminLimit : visibleCategoryLimit}
            search={search} activeCategories={activeCategories} onAddClick={() => setIsModalOpen(true)}
            isSelectMode={isSelectMode} selectedIds={selectedIds} onSelectToggle={toggleSelection}
            settings={settings} updateSetting={updateSetting} toggleSelectMode={() => { setIsSelectMode(!isSelectMode); setSelectedIds(new Set()); }}
          />

          {/* ADMİN ÇIKIŞ BUTONU */}
          {isAdmin && (
            <button 
              onClick={logout} 
              className="fixed bottom-6 right-6 z-[100] bg-stone-900 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 active:scale-90 transition-all group"
            >
              <span className="absolute right-14 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {LABELS.adminCloseBtn}
              </span>
              🚪
            </button>
          )}

          {!isAdmin && products.length > 0 && (
            <div className="mt-12 flex justify-center">
              {visibleCategoryLimit < existingCategories.length ? (
                <button 
                  onClick={() => setVisibleCategoryLimit(prev => prev + 1)} 
                  className="bg-white border-2 border-stone-200 text-stone-900 px-10 py-4 rounded-full font-black text-xs uppercase hover:border-stone-900 transition-all shadow-xl active:scale-95"
                >
                  {LABELS.loadMoreBtn}
                </button>
              ) : (
                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                  {LABELS.allProductsLoaded}
                </p>
              )}
            </div>
          )}

          {(loading || settingsLoading) && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </main>

      <Footer 
        onLogoClick={handleLogoClick} 
        isAdmin={isAdmin} 
        activeDiscount={activeDiscount} 
        onApplyDiscount={applyCode} 
        discountError={discountError} 
        onDeleteAll={deleteAllProducts} 
        settings={settings}
      />
      
      {isAdmin && (
        <AddProductModal
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          onAdd={addProduct} categories={existingCategories}
        />
      )}
    </div>
  );
}
