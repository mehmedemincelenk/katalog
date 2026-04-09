import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AddProductModal from './components/AddProductModal';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';
import { useDiscount } from './hooks/useDiscount';
import { UI, LABELS } from './data/config';

/**
 * APP BİLEŞENİ (STRATEJİK ANALİZ)
 * ----------------------------
 * Bir kurucu olarak bu dosya senin "Genel Müdürlüğündür".
 */
export default function App() {
  const { isAdmin, handleLogoClick, logout } = useAdminMode();
  const { activeDiscount, applyCode, error: discountError } = useDiscount();

  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products, categoryOrder, loading, addProduct, deleteProduct, updateProduct,
    renameCategory, removeCategoryFromProducts, existingCategories, reorderCategory, reorderProductsInCategory,
    deleteAllProducts, // Toplu silme fonksiyonu buraya geldi.
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

  return (
    <div className={`min-h-screen flex flex-col ${UI.layout.bodyBg}`}>
      <Navbar />
      
      <main className="flex-grow">
        <HeroCarousel isAdmin={isAdmin} />
        
        <SearchFilter
          products={products} categoryOrder={categoryOrder} onCategoryOrderChange={reorderCategory}
          search={search} onSearchChange={setSearch} activeCategories={activeCategories}
          onCategoryToggle={toggleCategory} isAdmin={isAdmin}
          renameCategory={renameCategory} removeCategoryFromProducts={removeCategoryFromProducts}
        />

        <div className={UI.layout.container}>
          
          {/* ADMİN ÖZEL: TOPLU SİLME VE YÖNETİM BUTONLARI */}
          {isAdmin && (
            <div className="mb-6 flex justify-end gap-2">
              <button 
                onClick={deleteAllProducts}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                Tüm Ürünleri Sil 🗑️
              </button>
            </div>
          )}

          <ProductGrid
            products={products} categoryOrder={categoryOrder} isAdmin={isAdmin}
            onDelete={deleteProduct} onUpdate={updateProduct} onOrderUpdate={reorderProductsInCategory}
            activeDiscount={activeDiscount} 
            visibleCategoryLimit={isAdmin ? UI.layout.adminLimit : visibleCategoryLimit}
            search={search} activeCategories={activeCategories} onAddClick={() => setIsModalOpen(true)}
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

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </main>

      <Footer onLogoClick={handleLogoClick} isAdmin={isAdmin} activeDiscount={activeDiscount} onApplyDiscount={applyCode} discountError={discountError} />
      
      {isAdmin && (
        <AddProductModal
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          onAdd={addProduct} categories={existingCategories}
        />
      )}
    </div>
  );
}
