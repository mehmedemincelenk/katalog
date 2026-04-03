import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import AddProductModal from './components/AddProductModal';
import References from './components/References';
import Footer from './components/Footer';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';

export default function App() {
  const { isAdmin, handleLogoClick } = useAdminMode();
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Business Logic Encapsulated in Hook
  const {
    products,
    allProducts,
    existingCategories,
    categoryOrder,
    loading,
    error, // error eklendi
    updateProduct,
    removeProduct,
    addProduct,
    renameCategory,
    removeCategoryFromProducts,
    updateCategoryOrder,
  } = useProducts(search, activeCategories, isAdmin);

  useEffect(() => {
    if (isAdmin) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAdmin]);

  // 1. Yüklenme Durumu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse text-sm">
            Ürünler Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  // 2. Hata (Bakım) Durumu
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 text-center">
        <div className="max-w-md flex flex-col items-center gap-4">
          <span className="text-6xl mb-2">🛠️</span>
          <h1 className="text-xl font-bold text-stone-800">
            Katalog Şu An Bakımdadır
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Sizlere daha iyi hizmet verebilmek için güncellemeler yapıyoruz.
            Lütfen kısa bir süre sonra tekrar ziyaret ediniz.
          </p>
          <div className="mt-4 px-4 py-2 bg-stone-100 rounded text-[10px] text-stone-400 font-mono uppercase tracking-widest">
            {error}
          </div>
        </div>
      </div>
    );
  }
  const toggleCategory = (cat) => {
    if (cat === 'Tümü') {
      setActiveCategories([]);
      return;
    }
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <HeroCarousel isAdmin={isAdmin} />

      <SearchFilter
        products={allProducts}
        categoryOrder={categoryOrder}
        updateCategoryOrder={updateCategoryOrder}
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onCategoryToggle={toggleCategory}
        isAdmin={isAdmin}
        renameCategory={renameCategory}
        removeCategoryFromProducts={removeCategoryFromProducts}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {isAdmin && (
          <div className="flex items-center justify-end mb-2">
            <div className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded">
              🔓 Admin Modu Aktif
            </div>
          </div>
        )}

        <ProductGrid
          products={products}
          categoryOrder={categoryOrder}
          isAdmin={isAdmin}
          onDelete={removeProduct}
          onUpdate={updateProduct}
        />
      </main>

      <References />
      <Footer onLogoClick={handleLogoClick} isAdmin={isAdmin} />

      {/* Floating Action Button (Admin) */}
      {isAdmin && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-stone-900 text-white text-4xl pb-1.5 shadow-xl hover:bg-stone-700 transition-all flex items-center justify-center active:scale-95"
          aria-label="Yeni Ürün Ekle"
        >
          +
        </button>
      )}

      {showAddModal && (
        <AddProductModal
          categories={existingCategories}
          onAdd={addProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
