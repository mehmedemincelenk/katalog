import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AddProductModal from './components/AddProductModal';
import FloatingAdminMenu from './components/FloatingAdminMenu';
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

  const {
    products, categoryOrder, loading, addProduct, deleteProduct, updateProduct,
    renameCategory, removeCategoryFromProducts, existingCategories, reorderCategory, reorderProductsInCategory,
    deleteAllProducts
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

  return (
    <div className={`min-h-screen flex flex-col ${UI.layout.bodyBg}`}>
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
          />

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
