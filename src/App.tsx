// FILE ROLE: Root Application Entry Point & Global State Orchestrator
// DEPENDS ON: React, Framer Motion, All Feature Modals, useProducts, useAdminMode, useSettings
// CONSUMED BY: main.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import FloatingAdminMenu from './components/FloatingAdminMenu';
import AddProductModal from './components/AddProductModal';
import BulkPriceUpdateModal from './components/BulkPriceUpdateModal';
import PinModal from './components/PinModal';
import QRModal from './components/QRModal';
import References from './components/References';
import LandingPage from './components/LandingPage';
import DisplaySettingsModal from './components/DisplaySettingsModal';
import OffHoursNotice from './components/OffHoursNotice';
import MaintenancePage from './components/MaintenancePage';
import FloatingGuestMenu from './components/FloatingGuestMenu';
import CouponModal from './components/CouponModal';
import PriceListModal from './components/PriceListModal';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';
import { useDiscount } from './hooks/useDiscount';
import { useSettings } from './hooks/useSettings';
import { UI } from './data/config';
import { getActiveStoreSlug } from './utils/store';

/**
 * CATALOG VIEW: Sadece dükkanlar için çalışan ana bileşen.
 */
function CatalogView() {
  const { 
    isAdmin, 
    handleLogoPointerDown, 
    handleLogoPointerUp, 
    isPinModalOpen, 
    setIsPinModalOpen, 
    isQRModalOpen,
    setIsQRModalOpen,
    verifyPinWithServer, 
    onPinSuccess,
    isInlineEnabled,
    toggleInlineEdit,
    isLockedOut,
    failedAttempts
  } = useAdminMode();
  const { settings, updateSetting, loading: settingsLoading, notFound, isError, retry } = useSettings(isAdmin);
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const [visitorCurrency, setVisitorCurrency] = useState<'TRY' | 'USD' | 'EUR'>(() => {
    return (localStorage.getItem('ekatalog_visitor_currency') as 'TRY' | 'USD' | 'EUR') || 'TRY';
  });

  const handleVisitorCurrencyToggle = useCallback(() => {
    const cycle: Record<string, 'TRY' | 'USD' | 'EUR'> = { 'TRY': 'USD', 'USD': 'EUR', 'EUR': 'TRY' };
    const next = cycle[visitorCurrency] || 'TRY';
    setVisitorCurrency(next);
    localStorage.setItem('ekatalog_visitor_currency', next);
  }, [visitorCurrency]);

  const displayCurrency = isAdmin ? settings.activeCurrency : visitorCurrency;

  const handleCurrencyToggle = useCallback(() => {
    const cycle: Record<string, CompanySettings['activeCurrency']> = { 'TRY': 'USD', 'USD': 'EUR', 'EUR': 'TRY' };
    updateSetting('activeCurrency', cycle[settings.activeCurrency] || 'TRY');
  }, [settings.activeCurrency, updateSetting]);

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
    executeGranularBulkActions,
    uploadImage,
    loading: productsLoading 
  } = useProducts(search, activeCategories, isAdmin, settings, updateSetting);
  
  const { activeDiscount, applyCode, error: discountError } = useDiscount();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [activeAdminProductId, setActiveAdminProductId] = useState<string | null>(null);
  const [visibleCategoryLimit, setVisibleCategoryLimit] = useState(2);

  // FAVICON & TITLE SYNC (With Fallback Protection)
  useEffect(() => {
    // 1. Title Sync
    const baseTitle = settings.title || 'E-Katalog';
    document.title = isAdmin ? `[Admin] ${baseTitle}` : baseTitle;

    // 2. Favicon Sync
    if (!settings.id) return;
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    
    // Fallback logic: Use logoUrl if it's a valid path/URI
    if (settings.logoUrl) {
      link.href = settings.logoUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings.logoUrl, settings.title, settings.id, isAdmin]);

  if (settingsLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={UI.errorState.overlay}>
        <div className={UI.errorState.card}>
          <span className={UI.errorState.icon}>📡</span>
          <h2 className={UI.errorState.title}>Bağlantı Hatası</h2>
          <p className={UI.errorState.description}>Dükkan verileri yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.</p>
          <button onClick={retry} className={UI.errorState.button}>TEKRAR DENE</button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <LandingPage />;
  }

  if (settings.maintenanceMode?.enabled && !isAdmin) {
    return (
      <>
        <MaintenancePage settings={settings} onLogoPointerDown={handleLogoPointerDown} onLogoPointerUp={handleLogoPointerUp} />
        {isPinModalOpen && (
          <PinModal 
            isModalOpen={isPinModalOpen} 
            onModalClose={() => setIsPinModalOpen(false)} 
            onAuthenticationSuccess={onPinSuccess}
            onVerify={verifyPinWithServer}
            isLockedOut={isLockedOut}
            failedAttempts={failedAttempts}
          />
        )}
      </>
    );
  }

  return (
    <div className={`min-h-screen ${UI.layout.bodyBg} ${UI.layout.selection} font-sans fade-in`}>
      <div className="print:hidden">
        <Navbar onLogoPointerDown={handleLogoPointerDown} onLogoPointerUp={handleLogoPointerUp} isAdmin={isAdmin} isInlineEnabled={isInlineEnabled} settings={settings} updateSetting={updateSetting} search={search} onSearchChange={setSearch} />
        <main>
          <HeroCarousel isAdminModeActive={isAdmin} />
          <SearchFilter 
            products={products} categoryOrder={categoryOrder} onCategoryOrderChange={updateCategoryOrder}
            search={search} onSearchChange={setSearch} activeCategories={activeCategories} onCategoryToggle={(cat) => {
              if (cat === 'Tüm Ürünler') setActiveCategories([]);
              else setActiveCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
            }}
            isAdmin={isAdmin} renameCategory={renameCategory}
            displayConfig={settings.displayConfig}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductGrid 
              products={products} categoryOrder={categoryOrder} isAdmin={isAdmin} isInlineEnabled={isInlineEnabled}
              onDelete={deleteProduct} onUpdate={updateProduct} onOrderUpdate={reorderProductsInCategory}
              onImageUpload={uploadImage}
              activeDiscount={activeDiscount} visibleCategoryLimit={visibleCategoryLimit}
              onLoadMore={() => setVisibleCategoryLimit(prev => prev + 3)}
              activeCategories={activeCategories} onAddClick={() => setIsAddModalOpen(true)}
              activeAdminProductId={activeAdminProductId}
              setActiveAdminProductId={setActiveAdminProductId}
              showPrice={settings.displayConfig.showPrice ?? true}
              displayCurrency={displayCurrency}
              exchangeRates={settings.exchangeRates}
              socialProofCards={settings.socialProofCards}
            />
          </div>
          {settings.displayConfig.showReferences && (
            <>
              {!isAdmin && <References isInlineEnabled={isInlineEnabled} />}
              {isAdmin && <References isAdmin={true} isInlineEnabled={isInlineEnabled} />}
            </>
          )}
        </main>
        <Footer 
          onLogoClick={() => {}} 
          onQRClick={() => setIsQRModalOpen(true)}
          isAdmin={isAdmin} 
          activeDiscount={activeDiscount} 
          onApplyDiscount={applyCode} 
          discountError={discountError} 
          settings={settings} 
        />
      </div>
      
      <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

      {/* OFF-HOURS ENGAGEMENT: Only for customers */}
      {!isAdmin && (
        <div className="print:hidden">
          <OffHoursNotice whatsappNumber={settings.whatsapp} />
        </div>
      )}

      {!isAdmin && (
        <div className="fixed bottom-2 right-2 z-[90] print:hidden">
          <FloatingGuestMenu 
            activeCurrency={visitorCurrency} 
            onCurrencyToggle={handleVisitorCurrencyToggle} 
            whatsappNumber={settings.whatsapp}
            onCouponClick={() => setIsCouponModalOpen(true)}
            onExcelClick={() => setIsPriceListModalOpen(true)}
            onSearchClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const searchInput = document.querySelector('input[placeholder*="ara"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }, 600);
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {isAdmin && (
          <>
            <motion.div
              key="floating-menu"
              initial={false}
              animate={{ opacity: 1, scale: 1, transform: 'translateZ(0)' }}
              exit={{ opacity: 0, filter: 'blur(15px)', scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="fixed bottom-2 right-2 z-[150] print:hidden"
            >
              <FloatingAdminMenu 
                onProductAddTrigger={() => setIsAddModalOpen(true)} 
                onBulkUpdateTrigger={() => setIsBulkUpdateModalOpen(true)} 
                onSettingsTrigger={() => setIsDisplaySettingsOpen(true)}
                activeCurrency={settings.activeCurrency}
                onCurrencyToggle={handleCurrencyToggle}
              />
            </motion.div>

            {/* Admin Modals (Separated to stay full-screen) */}
            <AddProductModal isModalOpen={isAddModalOpen} onModalClose={() => setIsAddModalOpen(false)} onProductAddition={addProduct} availableCategories={categoryOrder} />
            <BulkPriceUpdateModal 
              isOpen={isBulkUpdateModalOpen} 
              onClose={() => setIsBulkUpdateModalOpen(false)} 
              allProducts={allProducts} 
              categories={categoryOrder} 
              onGranularUpdate={executeGranularBulkActions}
            />
            <DisplaySettingsModal 
              isOpen={isDisplaySettingsOpen} 
              onClose={() => setIsDisplaySettingsOpen(false)} 
              settings={settings} 
              updateSetting={updateSetting}
              isInlineEnabled={isInlineEnabled}
              onToggleInline={toggleInlineEdit}
            />
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPinModalOpen && (
          <PinModal 
            isModalOpen={true} 
            onVerify={verifyPinWithServer} 
            onAuthenticationSuccess={onPinSuccess} 
            onModalClose={() => setIsPinModalOpen(false)} 
            isLockedOut={isLockedOut} 
            failedAttempts={failedAttempts}
          />
        )}
      </AnimatePresence>
      
      <CouponModal 
        isOpen={isCouponModalOpen} 
        onClose={() => setIsCouponModalOpen(false)} 
        onApplyDiscount={applyCode} 
        activeDiscount={activeDiscount} 
        discountError={discountError} 
      />

      <PriceListModal 
        isOpen={isPriceListModalOpen}
        onClose={() => setIsPriceListModalOpen(false)}
        products={allProducts}
        categories={categoryOrder}
        displayCurrency={displayCurrency}
        exchangeRates={settings.exchangeRates}
        activeDiscount={activeDiscount}
        storeName={settings.title || 'Katalog'}
      />
    </div>
  );
}

/**
 * MAIN APP: Ana sayfa mı yoksa dükkan mı olduğuna burada karar verilir.
 */
export default function App() {
  const currentSlug = getActiveStoreSlug();

  // Eğer ana sayfadaysak kataloğa dair HİÇBİR hook çalışmaz, direkt tanıtım sayfası gelir.
  if (currentSlug === 'main-site') {
    return <LandingPage />;
  }

  // Sadece subdomain varsa kataloğu yükle.
  return <CatalogView />;
}
