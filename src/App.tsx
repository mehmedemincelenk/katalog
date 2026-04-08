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
  } = useProducts();

  const { isAdmin, handleLogoClick, logout } = useAdminMode();
  const { activeDiscount, applyCode, error: discountError } = useDiscount();

  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // Sayfalama için kategorileri grupla
  const allCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category || 'KATEGORİSİZ'))];
    return sortCategories(cats, categoryOrder);
  }, [products, categoryOrder]);

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
          {isAdmin && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                <button 
                  onClick={logout}
                  className="text-sm font-bold text-amber-900 hover:underline"
                  title="Admin modundan çıkmak için tıkla"
                >
                  ADMİN MODU AKTİF (Kapatmak için tıkla)
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-stone-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <span>+</span> Yeni Ürün Ekle
              </button>
            </div>
          )}

          <ProductGrid
            products={filteredProducts}
            categoryOrder={categoryOrder}
            isAdmin={isAdmin}
            onDelete={deleteProduct}
            onUpdate={updateProduct}
            onOrderUpdate={setProducts}
            activeDiscount={activeDiscount}
            visibleCategoryLimit={isAdmin ? 999 : visibleCategoryLimit}
            search={search}
            activeCategories={activeCategories}
          />

          {!isAdmin && filteredProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              {/* Eğer gösterilecek daha fazla kategori varsa buton çıkar */}
              {visibleCategoryLimit < allCategories.length ? (
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
