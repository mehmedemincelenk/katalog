// FILE ROLE: Root Application Entry Point & Global State Orchestrator
// DEPENDS ON: React, Framer Motion, All Feature Modals, useProducts, useAdminMode, useSettings
// CONSUMED BY: main.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import { LABELS, UI } from './data/config';
import { Product } from './types';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Loading from './components/Loading';
import Button from './components/Button';
import Footer from './components/Footer';
import FloatingAdminMenu from './components/FloatingAdminMenu';
import References from './components/References';
import LandingPage from './components/LandingPage';
import OffHoursNotice from './components/OffHoursNotice';
import MaintenancePage from './components/MaintenancePage';
import FloatingGuestMenu from './components/FloatingGuestMenu';
import PinModal from './components/PinModal';
import AppModals from './components/AppModals';
import { useSyncMetadata } from './hooks/useUI';
import { useProducts } from './hooks/useProductsHub';
import { useAdminMode } from './hooks/useAdminMode';
import { useDiscount } from './hooks/useDiscount';
import { useSettings } from './hooks/useSettingsHub';
import { useStore } from './store/useStore';
import { getActiveStoreSlug } from './utils/store';

/**
 * CATALOG VIEW: Sadece dükkanlar için çalışan ana bileşen.
 */
function CatalogView() {
  const {
    isAdmin,
    settings,
    searchQuery: search,
    visitorCurrency,
    updateSetting,
    activeDiscount,
  } = useStore();

  const {
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
    failedAttempts,
  } = useAdminMode();

  const {
    loading: settingsLoading,
    notFound,
    isError,
    retry,
  } = useSettings(isAdmin);

  const displayCurrency = isAdmin
    ? settings?.activeCurrency || 'TRY'
    : visitorCurrency;

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
    addCategory,
    executeGranularBulkActions,
    uploadImage,
    loading: productsLoading,
  } = useProducts(search, [], isAdmin, settings);

  const { applyCode, error: discountError } = useDiscount();

  // Otopilot: Sync Metadata
  useSyncMetadata(settings, isAdmin);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [isGlobalAddMenuOpen, setIsGlobalAddMenuOpen] = useState(false);
  const [activeAdminProductId, setActiveAdminProductId] = useState<
    string | null
  >(null);
  const [visibleCategoryLimit, setVisibleCategoryLimit] = useState(2);
  const [aiStudioProduct, setAiStudioProduct] = useState<Product | null>(null);
  const [pendingAddCategory, setPendingAddCategory] = useState<
    string | undefined
  >(undefined);

  const handleOpenAddModal = (category?: string) => {
    setPendingAddCategory(category);
    setIsAddModalOpen(true);
  };

  const handleGlobalAddAction = (
    type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL',
  ) => {
    if (type === 'PRODUCT') setIsAddModalOpen(true);
    else if (type === 'CATEGORY') {
      const name = window.prompt('Yeni Reyon/Kategori Adı:');
      if (name) {
        const addCategoryFn = window.__ekatalog_addCategory;
        if (addCategoryFn) addCategoryFn(name);
      }
    } else if (type === 'REFERENCE') {
      const name = window.prompt('Yeni Referans/İş Ortağı Adı:');
      if (name) {
        const currentRefs = settings?.referencesData || [];
        updateSetting('referencesData', [
          ...currentRefs,
          { id: Date.now(), name, logo: '' },
        ]);
      }
    } else if (type === 'CAROUSEL') {
      window.dispatchEvent(new CustomEvent('ekatalog:add-carousel-slide'));
    }
  };

  // Bridge for Global Actions & Diamond Studio
  useEffect(() => {
    window.__ekatalog_addCategory = (name: string) => {
      addCategory(name);
    };
    window.__ekatalog_openAIStudioCompare = (productId: string) => {
      const p = allProducts.find((x) => x.id === productId);
      if (p) setAiStudioProduct(p);
    };
  }, [addCategory, allProducts]);

  if (settingsLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loading size="xl" label={LABELS.loading} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={UI.errorState.overlay}>
        <div className={UI.errorState.card}>
          <span className={UI.errorState.icon}>📡</span>
          <h2 className={UI.errorState.title}>Bağlantı Hatası</h2>
          <p className={UI.errorState.description}>
            Dükkan verileri yüklenirken bir sorun oluştu. Lütfen bağlantınızı
            kontrol edip tekrar deneyin.
          </p>
          <Button
            onClick={retry}
            variant="primary"
            mode="rectangle"
            className="w-full !py-3 font-black tracking-widest uppercase"
          >
            TEKRAR DENE
          </Button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <LandingPage />;
  }

  if (settings && settings.maintenanceMode?.enabled && !isAdmin) {
    return (
      <>
        <MaintenancePage
          settings={settings}
          onLogoPointerDown={handleLogoPointerDown}
          onLogoPointerUp={handleLogoPointerUp}
        />
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
    <div
      className={`min-h-screen ${UI.layout.bodyBg} ${UI.layout.selection} font-sans fade-in`}
    >
      <div className="print:hidden">
        <Navbar
          onLogoPointerDown={handleLogoPointerDown}
          onLogoPointerUp={handleLogoPointerUp}
          isInlineEnabled={isInlineEnabled}
        />
        <main>
          <HeroCarousel isAdminModeActive={isAdmin} />
          <SearchFilter
            products={products}
            categoryOrder={categoryOrder}
            onCategoryOrderChange={updateCategoryOrder}
            renameCategory={(oldName, newName) =>
              renameCategory({ oldName, newName })
            }
            onAddCategory={addCategory}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductGrid
              products={products}
              categoryOrder={categoryOrder}
              isInlineEnabled={isInlineEnabled}
              onDelete={deleteProduct}
              onUpdate={(id, changes) => updateProduct({ id, changes })}
              onOrderUpdate={reorderProductsInCategory}
              onImageUpload={(id, file) => uploadImage({ id, file })}
              visibleCategoryLimit={visibleCategoryLimit}
              onLoadMore={() => setVisibleCategoryLimit((prev) => prev + 3)}
              onAddClick={handleOpenAddModal}
              activeAdminProductId={activeAdminProductId}
              setActiveAdminProductId={setActiveAdminProductId}
              visitorCurrency={visitorCurrency}
            />
          </div>
          {settings?.displayConfig?.showReferences && (
            <References isInlineEnabled={isInlineEnabled} isAdmin={isAdmin} />
          )}
        </main>
        <Footer />
      </div>

      {/* OFF-HOURS ENGAGEMENT: Only for customers */}
      {!isAdmin && settings && (
        <div className="print:hidden">
          <OffHoursNotice whatsappNumber={settings.whatsapp} />
        </div>
      )}

      {!isAdmin && (
        <div className="fixed bottom-2 right-2 z-[90] print:hidden">
          <FloatingGuestMenu
            onCouponClick={() => setIsCouponModalOpen(true)}
            onExcelClick={() => setIsPriceListModalOpen(true)}
            onSearchClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const searchInput = document.querySelector(
                  'input[placeholder*="ara"]',
                ) as HTMLInputElement;
                if (searchInput) searchInput.focus({ preventScroll: true });
              }, 800);
            }}
            onQRClick={() => setIsQRModalOpen(true)}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {isAdmin && (
          <motion.div
            key="floating-menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-2 right-2 z-[150] print:hidden"
          >
            <FloatingAdminMenu
              onProductAddTrigger={() => setIsGlobalAddMenuOpen(true)}
              onBulkUpdateTrigger={() => setIsBulkUpdateModalOpen(true)}
              onSettingsTrigger={() => setIsDisplaySettingsOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AppModals
        isAdmin={isAdmin}
        settings={settings}
        categoryOrder={categoryOrder}
        allProducts={allProducts}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        isBulkUpdateModalOpen={isBulkUpdateModalOpen}
        setIsBulkUpdateModalOpen={setIsBulkUpdateModalOpen}
        isDisplaySettingsOpen={isDisplaySettingsOpen}
        setIsDisplaySettingsOpen={setIsDisplaySettingsOpen}
        isQRModalOpen={isQRModalOpen}
        setIsQRModalOpen={setIsQRModalOpen}
        isPinModalOpen={isPinModalOpen}
        setIsPinModalOpen={setIsPinModalOpen}
        isCouponModalOpen={isCouponModalOpen}
        setIsCouponModalOpen={setIsCouponModalOpen}
        isPriceListModalOpen={isPriceListModalOpen}
        setIsPriceListModalOpen={setIsPriceListModalOpen}
        isGlobalAddMenuOpen={isGlobalAddMenuOpen}
        setIsGlobalAddMenuOpen={setIsGlobalAddMenuOpen}
        aiStudioProduct={aiStudioProduct}
        setAiStudioProduct={setAiStudioProduct}
        pendingAddCategory={pendingAddCategory}
        setPendingAddCategory={setPendingAddCategory}
        addProduct={addProduct}
        uploadImage={uploadImage}
        updateProduct={updateProduct}
        updateSetting={updateSetting}
        executeGranularBulkActions={executeGranularBulkActions}
        handleGlobalAddAction={handleGlobalAddAction}
        verifyPinWithServer={verifyPinWithServer}
        onPinSuccess={onPinSuccess}
        isLockedOut={isLockedOut}
        failedAttempts={failedAttempts}
        isInlineEnabled={isInlineEnabled}
        toggleInlineEdit={toggleInlineEdit}
        applyCode={applyCode}
        activeDiscount={activeDiscount}
        discountError={discountError}
        displayCurrency={displayCurrency}
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
