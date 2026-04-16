import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import FloatingAdminMenu from './components/FloatingAdminMenu';
import AddProductModal from './components/AddProductModal';
import BulkPriceUpdateModal from './components/BulkPriceUpdateModal';
import PinModal from './components/PinModal';
import References from './components/References';
import LandingPage from './components/LandingPage';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';
import { useDiscount } from './hooks/useDiscount';
import { useSettings } from './hooks/useSettings';
import { UI } from './data/config';
import { getActiveStoreSlug } from './utils/store';

const CURRENT_SLUG = getActiveStoreSlug();

export default function App() {
  // 1. LANDING PAGE CHECK: If on root domain or specifically main-site, show marketing page instantly
  if (CURRENT_SLUG === 'main-site') {
    return <LandingPage />;
  }

  const { isAdmin, handleLogoPointerDown, handleLogoPointerUp, logout, isPinModalOpen, setIsPinModalOpen, correctPin, onPinSuccess } = useAdminMode();
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const { 
    products, 
    allProducts,
    categoryOrder, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    reorderCategory: updateCategoryOrder, 
    reorderProductsInCategory,
    renameCategory, 
    removeCategoryFromProducts, 
    addCategory, 
    bulkUpdatePrices,
    loading: productsLoading 
  } = useProducts(search, activeCategories, isAdmin);
  
  const { activeDiscount, applyCode, error: discountError } = useDiscount();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [visibleCategoryLimit, setVisibleCategoryLimit] = useState(2); // Test için 2'ye düşürdüm

  // DYNAMIC FAVICON SYNC
  useEffect(() => {
    if (!settings.logoEmoji) return;
    
    // Check if the logo is a URL or Data URI
    const isImage = settings.logoEmoji.startsWith('data:image') || settings.logoEmoji.startsWith('http');
    
    if (isImage) {
      const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.logoEmoji;
      document.getElementsByTagName('head')[0].appendChild(link);
      
      // Also update Apple Touch Icon for iOS
      const appleLink: HTMLLinkElement = document.querySelector("link[rel*='apple-touch-icon']") || document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = settings.logoEmoji;
      document.getElementsByTagName('head')[0].appendChild(appleLink);
    }
  }, [settings.logoEmoji]);

  const toggleCategory = useCallback((cat: string) => {
    if (cat === 'Tüm Ürünler') {
      setActiveCategories([]);
    } else {
      setActiveCategories((prev) =>
        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      );
    }
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         (p.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategories.length === 0 || activeCategories.includes(p.category);
    const isVisible = !p.is_archived || isAdmin;
    return matchesSearch && matchesCategory && isVisible;
  });

  if (settingsLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${UI.layout.bodyBg} ${UI.layout.selection} font-sans`}>
      <Navbar 
        onLogoPointerDown={handleLogoPointerDown} 
        onLogoPointerUp={handleLogoPointerUp}
        onLogout={logout}
        isAdmin={isAdmin} 
        settings={settings}
      />
      
      <main>
        <HeroCarousel isAdminModeActive={isAdmin} />
        
        <SearchFilter 
          products={products}
          categoryOrder={categoryOrder}
          onCategoryOrderChange={updateCategoryOrder}
          search={search}
          onSearchChange={setSearch}
          activeCategories={activeCategories}
          onCategoryToggle={toggleCategory}
          isAdmin={isAdmin}
          renameCategory={renameCategory}
          removeCategoryFromProducts={removeCategoryFromProducts}
          addCategory={addCategory}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid 
            products={filteredProducts}
            categoryOrder={categoryOrder}
            isAdmin={isAdmin}
            onDelete={deleteProduct}
            onUpdate={updateProduct}
            onOrderUpdate={reorderProductsInCategory}
            activeDiscount={activeDiscount}
            visibleCategoryLimit={visibleCategoryLimit}
            onLoadMore={() => setVisibleCategoryLimit(prev => prev + 3)}
            activeCategories={activeCategories}
            onAddClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {!isAdmin && <References />}
      </main>

      <Footer 
        onLogoClick={() => {}} // Handled via Pointer events in Navbar
        isAdmin={isAdmin}
        activeDiscount={activeDiscount}
        onApplyDiscount={applyCode}
        discountError={discountError}
        settings={settings}
      />

      {isAdmin && (
        <>
          <FloatingAdminMenu 
            onProductAddTrigger={() => setIsAddModalOpen(true)}
            onBulkUpdateTrigger={() => setIsBulkUpdateModalOpen(true)}
          />
          <AddProductModal 
            isModalOpen={isAddModalOpen}
            onModalClose={() => setIsAddModalOpen(false)}
            onProductAddition={addProduct}
            availableCategories={categoryOrder}
          />
          <BulkPriceUpdateModal 
            isOpen={isBulkUpdateModalOpen}
            onClose={() => setIsBulkUpdateModalOpen(false)}
            allProducts={allProducts}
            categories={categoryOrder}
            onUpdate={bulkUpdatePrices}
          />
        </>
      )}

      <PinModal 
        isModalOpen={isPinModalOpen}
        authorizedPinCode={correctPin}
        onAuthenticationSuccess={onPinSuccess}
        onModalClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
}
