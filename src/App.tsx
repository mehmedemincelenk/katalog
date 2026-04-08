import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AddProductModal from './components/AddProductModal';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';
import { useDiscount } from './hooks/useDiscount';
import { sortCategories } from './data/config';

export default function App() {
  const { isAdmin, handleLogoClick, logout } = useAdminMode();
  const { activeDiscount, applyCode, error: discountError } = useDiscount();

  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products,
    categoryOrder,
    loading,
    addProduct,
    deleteProduct,
    updateProduct,
    updateCategoryOrder,
    setProducts,
    renameCategory,
    removeCategoryFromProducts,
    existingCategories,
    reorderProductsInCategory,
  } = useProducts(search, activeCategories, isAdmin);
  
  // Her tıklamada 1 kategori daha göster (Başlangıçta 2 kategori + Admin her şeyi görür)
  const INITIAL_CAT_LIMIT = 3;
  const [visibleCategoryLimit, setVisibleCategoryLimit] = useState(INITIAL_CAT_LIMIT);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.description || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategories.length === 0 || activeCategories.includes(p.category || '');
      return matchSearch && matchCat;
    });
  }, [products, search, activeCategories]);

  const toggleCategory = (cat: string) => {
    if (cat === 'Tümü') {
      setActiveCategories([]);
    } else {
      setActiveCategories((prev) =>
        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      
      <main className="flex-grow">
        <HeroCarousel />
        
        <SearchFilter
          products={products}
          categoryOrder={categoryOrder}
          updateCategoryOrder={updateCategoryOrder}
          search={search}
          onSearchChange={setSearch}
          activeCategories={activeCategories}
          onCategoryToggle={toggleCategory}
          isAdmin={isAdmin}
          renameCategory={renameCategory}
          removeCategoryFromProducts={removeCategoryFromProducts}
          activeDiscount={activeDiscount}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductGrid
            products={filteredProducts}
            categoryOrder={categoryOrder}
            isAdmin={isAdmin}
            onDelete={deleteProduct}
            onUpdate={updateProduct}
            onOrderUpdate={reorderProductsInCategory}
            activeDiscount={activeDiscount}
            visibleCategoryLimit={isAdmin ? 999 : visibleCategoryLimit}
            search={search}
            activeCategories={activeCategories}
            onAddClick={() => setIsModalOpen(true)}
          />

          {/* Yüzen Admin Kapatma Butonu (Sağ Alt) */}
          {isAdmin && (
            <button 
              onClick={logout}
              className="fixed bottom-6 right-6 z-[100] bg-stone-900 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 active:scale-90 transition-all group"
              title="Admin Modunu Kapat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
              </svg>
              <span className="absolute right-14 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">ADMİNİ KAPAT</span>
            </button>
          )}

          {!isAdmin && filteredProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              {/* Eğer gösterilecek daha fazla kategori varsa buton çıkar */}
              {visibleCategoryLimit < existingCategories.length ? (
                <button
                  onClick={() => setVisibleCategoryLimit(prev => prev + 1)}
                  className="bg-white border-2 border-stone-200 text-stone-900 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:border-stone-900 hover:bg-stone-50 transition-all shadow-xl active:scale-95"
                >
                  Daha Fazla Ürün Göster ↓
                </button>
              ) : (
                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Tüm Ürünler Listelendi</p>
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

      <Footer onLogoClick={handleLogoClick} applyCode={applyCode} discountError={discountError} />
      
      {isAdmin && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addProduct}
          categories={[...new Set(products.map((p) => p.category).filter(Boolean))]}
        />
      )}
    </div>
  );
}
