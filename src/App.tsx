import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AddProductModal from './components/AddProductModal';
import FloatingAdminMenu from './components/FloatingAdminMenu';
import PinModal from './components/PinModal';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';
import { useDiscount } from './hooks/useDiscount';
import { useSettings } from './hooks/useSettings';
import { UI, LABELS } from './data/config';

export default function App() {
  const { 
    isAdmin, handleLogoClick, logout, 
    isPinModalOpen, setIsPinModalOpen, correctPin, onPinSuccess 
  } = useAdminMode();
  
  const { activeDiscount, applyCode, error: discountError } = useDiscount();
  const { settings, updateSetting } = useSettings(isAdmin);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAdmin]);

  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products, allProducts, categoryOrder, loading, addProduct, deleteProduct, updateProduct,
    existingCategories, reorderCategory, reorderProductsInCategory,
    deleteAllProducts, renameCategory, removeCategoryFromProducts, uploadImage
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

  useEffect(() => {
    if (!isAdmin) return;
    const handlePointerDown = (e: PointerEvent) => {
      const active = document.activeElement;
      if (active && active.hasAttribute('contenteditable') && active !== e.target) {
        e.preventDefault();
        (active as HTMLElement).blur();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [isAdmin]);

  return (
    <div className={`min-h-screen flex flex-col ${UI.layout.bodyBg}`}>
      {!isOnline && (
        <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest py-2 text-center sticky top-0 z-[100] animate-in slide-in-from-top duration-300">
          ⚠️ İnternet Bağlantınız Kesildi. Bazı özellikler çalışmayabilir.
        </div>
      )}
      <Navbar settings={settings} isAdmin={isAdmin} updateSetting={updateSetting} />
      
      {isAdmin && (
        <FloatingAdminMenu 
          onLogout={logout}
          onAddClick={() => setIsModalOpen(true)}
        />
      )}
      
      <main className="flex-grow">
        <HeroCarousel isAdmin={isAdmin} />
        
        <SearchFilter
          products={allProducts} categoryOrder={categoryOrder} onCategoryOrderChange={reorderCategory}
          search={search} onSearchChange={setSearch} activeCategories={activeCategories}
          onCategoryToggle={toggleCategory} isAdmin={isAdmin}
          renameCategory={renameCategory} removeCategoryFromProducts={removeCategoryFromProducts} 
        />

        <div className={UI.layout.container}>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ProductGrid
              products={products} categoryOrder={categoryOrder} isAdmin={isAdmin}
              onDelete={deleteProduct} onUpdate={updateProduct} onOrderUpdate={reorderProductsInCategory}
              onImageUpload={uploadImage}
              activeDiscount={activeDiscount} 
              visibleCategoryLimit={isAdmin ? UI.layout.adminLimit : visibleCategoryLimit}
              search={search} activeCategories={activeCategories} onAddClick={() => setIsModalOpen(true)}
            />
          )}

          {!isAdmin && !loading && products.length > 0 && (
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

      {/* PIN Giriş Modalı */}
      <PinModal 
        isOpen={isPinModalOpen}
        correctPin={correctPin}
        onSuccess={onPinSuccess}
        onClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
}
