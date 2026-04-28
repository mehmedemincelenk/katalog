// FILE ROLE: Root Application Entry Point & Global State Orchestrator
// DEPENDS ON: React, Framer Motion, All Feature Modals, useProducts, useAdminMode, useSettings
// CONSUMED BY: main.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useGlobalFeedback } from './hooks/useGlobalFeedback';
import Navbar from './components/Navbar';
import { THEME, LABELS, UI } from './data/config';
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
import StatusOverlay from './components/StatusOverlay';
import FloatingGuestMenu from './components/FloatingGuestMenu';
import AppModals from './components/AppModals';
import { useSyncMetadata } from './hooks/useCommon';
import { useProducts } from './hooks/useProductsHub';
import { useAdminMode } from './hooks/useAdminMode';
import { useSettings } from './hooks/useSettingsHub';
import { useStore } from './store';
import { getActiveStoreSlug } from './utils/core';
import ModalWorkspace from './components/ModalWorkspace';
import { Layout } from 'lucide-react';

/**
 * CATALOG VIEW: Sadece dükkanlar için çalışan ana bileşen.
 */
function CatalogView() {
  const {
    isAdmin,
    settings,
    searchQuery: search,
    visitorCurrency,
    openModal,
  } = useStore();

  const {
    handleLogoPointerDown,
    handleLogoPointerUp,
    isInlineEnabled,
  } = useAdminMode();

  const {
    loading: settingsLoading,
    notFound,
    isError,
    retry,
  } = useSettings(isAdmin);

  const {
    products,
    categoryOrder,
    sortedList,
    stats,
    deleteProduct,
    updateProduct,
    reorderCategory: updateCategoryOrder,
    reorderProductsInCategory,
    renameCategory,
    addCategory,
    uploadImage,
    loading: productsLoading,
  } = useProducts(search, [], isAdmin, settings);

  // Otopilot: Sync Metadata
  useSyncMetadata(settings, isAdmin);

  const [visibleCategoryLimit, setVisibleCategoryLimit] = useState(2);
  const [activeAdminProductId, setActiveAdminProductId] = useState<string | null>(null);

  const toggleWorkspace = useStore((state) => state.toggleWorkspace);

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
        <MaintenancePage />
        <AppModals />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center sm:py-8 sm:px-4 overflow-hidden">
      {/* MOBILE FRAME FOR DESKTOP */}
      <div 
        className="w-full max-w-[480px] min-h-screen sm:min-h-[88vh] sm:h-[88vh] bg-stone-50 sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden sm:rounded-[3rem] border-0 sm:border-[10px] sm:border-stone-900 flex flex-col"
        id="app-mobile-frame"
      >
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden ${UI.layout.bodyBg} ${UI.layout.selection} font-sans fade-in scrollbar-hide`}
          style={{ scrollBehavior: 'smooth' }}
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
                sortedList={sortedList}
                stats={stats}
                onCategoryOrderChange={updateCategoryOrder}
                renameCategory={(oldName, newName) =>
                  renameCategory({ oldName, newName })
                }
                onAddCategory={addCategory}
              />
              <div className="px-4">
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
                  onAddClick={(cat) => openModal('ADD_PRODUCT', { category: cat })}
                  activeAdminProductId={activeAdminProductId}
                  setActiveAdminProductId={setActiveAdminProductId}
                  visitorCurrency={visitorCurrency}
                  renameCategory={(oldName, newName) =>
                    renameCategory({ oldName, newName })
                  }
                />
              </div>
              {settings?.displayConfig?.showReferences && (
                <References isInlineEnabled={isInlineEnabled} isAdmin={isAdmin} />
              )}
            </main>
            <Footer />
          </div>

          {!isAdmin && (
            <div className="fixed sm:absolute bottom-4 right-4 z-[90] print:hidden">
              <FloatingGuestMenu
                onCouponClick={() => openModal('COUPON')}
                onExcelClick={() => openModal('PRICE_LIST')}
                onSearchClick={() => {
                  const scrollContainer = document.getElementById('app-mobile-frame')?.firstElementChild;
                  if (scrollContainer) {
                    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                  setTimeout(() => {
                    const searchInput = document.getElementById('mobile-search-input') as HTMLInputElement;
                    if (searchInput) {
                      searchInput.focus({ preventScroll: true });
                    }
                  }, 400);
                }}
                onQRClick={() => openModal('QR')}
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
                className="fixed sm:absolute bottom-4 right-4 z-[150] print:hidden"
              >
                <FloatingAdminMenu
                  onProductAddTrigger={() => openModal('GLOBAL_ADD_MENU')}
                  onBulkUpdateTrigger={() => openModal('BULK_UPDATE')}
                  onSettingsTrigger={() => openModal('DISPLAY_SETTINGS')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AppModals />
        <ModalWorkspace />

        {/* DEVELOPER WORKSPACE TRIGGER (Bottom Left) */}
        <div className="fixed sm:absolute bottom-4 left-4 z-[9999] print:hidden">
          <Button
            onClick={toggleWorkspace}
            variant="secondary"
            mode="circle"
            className="!w-12 !h-12 !bg-stone-900/10 hover:!bg-stone-900 !text-stone-900 hover:!text-white border-stone-900/20 shadow-lg backdrop-blur-md group"
            icon={<Layout size={18} className="group-hover:rotate-12 transition-transform" />}
            aria-label="Diamond Workspace"
          />
        </div>

        <GlobalFeedbackOverlay />
      </div>
    </div>
  );
}

function GlobalFeedbackOverlay() {
  const { status, message, clearFeedback } = useGlobalFeedback();
  return <StatusOverlay status={status} message={message} onClose={clearFeedback} />;
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
