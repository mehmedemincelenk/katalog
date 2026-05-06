// FILE ROLE: Root Application Entry Point & Global State Orchestrator
// DEPENDS ON: React, Framer Motion, All Feature Modals, useProducts, useAdminMode, useSettings
// CONSUMED BY: main.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useGlobalFeedback } from './hooks/useGlobalFeedback';
import Navbar from './components/Navbar';
import { LABELS, UI } from './data/config';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import Loading from './components/Loading';
import Button from './components/Button';
import Footer from './components/Footer';
import FloatingAdminMenu from './components/FloatingAdminMenu';
import References from './components/References';
import LandingPage from './components/LandingPage';
import MaintenancePage from './components/MaintenancePage';
import StatusOverlay from './components/StatusOverlay';
import FloatingGuestMenu from './components/FloatingGuestMenu';
import AppModals from './components/AppModals';
import { useSyncMetadata } from './hooks/useCommon';
import { useProducts } from './hooks/useProductsHub';
import { useAdminMode } from './hooks/useAdminMode';
import { useSettings } from './hooks/useSettingsHub';
import { useStore } from './store';
import { getActiveStoreSlug, fetchCurrentRates } from './utils/core';
import ModalWorkspace from './components/ModalWorkspace';

/**
 * CATALOG VIEW: Sadece dükkanlar için çalışan ana bileşen.
 */
function CatalogView() {
  // 1. DATA & STATE
  const {
    isAdmin,
    settings: storeSettings,
    searchQuery: search,
    visitorCurrency,
    openModal,
    setExchangeRates,
  } = useStore();

  // 2. CURRENCY ORCHESTRATION (Diamond Engine)
  useEffect(() => {
    const initRates = async () => {
      const rates = await fetchCurrentRates();
      if (rates) setExchangeRates(rates);
    };
    initRates();
  }, [setExchangeRates]);

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
    loading: productsFetching,
  } = useProducts(search, [], isAdmin, storeSettings);

  useSyncMetadata(storeSettings, isAdmin);

  const [visibleCategoryLimit, setVisibleCategoryLimit] = useState(2);
  const [activeAdminProductId, setActiveAdminProductId] = useState<string | null>(null);
  const toggleWorkspace = useStore((state) => state.toggleWorkspace);

  // 2. LOADING & ERROR STATES (Bulletproof)
  if (settingsLoading) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-stone-50">
        <Loading size="xl" label={LABELS.loading} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 z-[999999] bg-stone-900/90 backdrop-blur-xl flex items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl">
          <span className="text-6xl mb-6 block">📡</span>
          <h2 className="text-2xl font-black text-stone-900 mb-2 uppercase">Bağlantı Hatası</h2>
          <p className="text-stone-500 mb-8">Dükkan verileri yüklenirken bir sorun oluştu.</p>
          <Button onClick={retry} variant="primary" mode="rectangle" className="w-full !py-4 font-black">TEKRAR DENE</Button>
        </div>
      </div>
    );
  }

  if (notFound) return <LandingPage />;

  if (storeSettings && storeSettings.maintenanceMode?.enabled && !isAdmin) {
    return (
      <div className="relative z-0">
        <MaintenancePage onLogoPointerDown={handleLogoPointerDown} onLogoPointerUp={handleLogoPointerUp} />
        <AppModals />
      </div>
    );
  }

  // 3. RENDER ENGINE
  const mobileContent = (
    <>
      <div className="relative w-full h-full overflow-hidden flex flex-col">
        {/* SCROLLABLE LAYER */}
        <div id="mobile-viewport-scroll" className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth relative z-10">
          <div className="print:hidden pb-0">
            <Navbar onLogoPointerDown={handleLogoPointerDown} onLogoPointerUp={handleLogoPointerUp} isInlineEnabled={isInlineEnabled} />
            <main className="bg-stone-50">
              <HeroCarousel isAdminModeActive={isAdmin} />
              <SearchFilter sortedList={sortedList} stats={stats} onCategoryOrderChange={updateCategoryOrder} renameCategory={(oldName, newName) => renameCategory({ oldName, newName })} onAddCategory={addCategory} />
              <div className="px-4">
                {productsFetching && products.length === 0 ? (
                  <div className="py-20 flex justify-center"><Loading size="md" /></div>
                ) : (
                  <ProductGrid
                    products={products}
                    categoryOrder={categoryOrder}
                    isInlineEnabled={isInlineEnabled}
                    onDelete={deleteProduct}
                    onUpdate={(id, changes) => updateProduct({ id, changes })}
                    onOrderUpdate={updateCategoryOrder}
                    onOrderIndexChange={reorderProductsInCategory}
                    onImageUpload={(id, file) => uploadImage({ id, file })}
                    visibleCategoryLimit={visibleCategoryLimit}
                    onLoadMore={() => setVisibleCategoryLimit((prev) => prev + 3)}
                    onAddClick={(cat) => openModal('ADD_PRODUCT', { category: cat })}
                    activeAdminProductId={activeAdminProductId}
                    setActiveAdminProductId={setActiveAdminProductId}
                    visitorCurrency={visitorCurrency}
                    renameCategory={(oldName, newName) => renameCategory({ oldName, newName })}
                  />
                )}
              </div>
              {storeSettings?.displayConfig?.showReferences && <References isInlineEnabled={isInlineEnabled} isAdmin={isAdmin} />}
            </main>
            <Footer />
            
            {/* CTA BANNER: EKATALOG PROMOTION */}
            <a 
              href="https://ekatalog.site" 
              target="_blank" 
              rel="noreferrer"
              className="block w-full bg-[#FFD700] hover:bg-[#FFC800] transition-colors py-2 px-6 text-center cursor-pointer"
            >
              <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">
                ekatalogunuz hala yoksa tıklayın
              </span>
            </a>
          </div>
        </div>

        {/* GLOBAL UI STACK (DIAMOND POSITIONING) */}
        <AppModals />
        <ModalWorkspace />
        
        {!isAdmin && (
          <div className="fixed inset-0 pointer-events-none z-[400] print:hidden">
            <div className="absolute bottom-10 right-4 pointer-events-auto">
              <FloatingGuestMenu
                onCouponClick={() => openModal('COUPON')}
                onExcelClick={() => openModal('PRICE_LIST')}
                onSearchClick={() => {
                  const scrollArea = document.getElementById('mobile-viewport-scroll');
                  if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => {
                    const searchInput = document.getElementById('mobile-search-input') as HTMLInputElement;
                    if (searchInput) searchInput.focus({ preventScroll: true });
                  }, 400);
                }}
                onQRClick={() => openModal('QR')}
              />
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {isAdmin && (
            <div className="fixed inset-0 pointer-events-none z-[400] print:hidden">
              <motion.div 
                key="floating-menu" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }} 
                className="absolute bottom-10 right-4 pointer-events-auto"
              >
                <FloatingAdminMenu 
                  onProductAddTrigger={() => openModal('GLOBAL_ADD_MENU')} 
                  onBulkUpdateTrigger={() => openModal('BULK_UPDATE')} 
                  onSettingsTrigger={() => openModal('DISPLAY_SETTINGS')} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="fixed inset-0 pointer-events-none z-[9999] print:hidden">
          <div className="absolute bottom-10 left-4 pointer-events-auto">
            <Button 
              onClick={toggleWorkspace} 
              variant="secondary" 
              mode="circle" 
              className="!w-12 !h-12 !bg-stone-900/10 hover:!bg-stone-900 !text-stone-900 hover:!text-white border-stone-900/20 shadow-lg backdrop-blur-md group" 
              icon={<Lucide.Layout size={18} className="group-hover:rotate-12 transition-transform" />} 
              aria-label="Diamond Workspace" 
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen font-sans md:bg-gradient-to-br md:from-stone-950 md:to-stone-900 flex md:overflow-hidden ${UI.layout.bodyBg} ${UI.layout.selection} relative z-0`}>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 select-none z-0">
        <div className="max-w-lg w-full space-y-10">
          <div className="space-y-4">
            <h1 className="text-[3.5rem] font-black text-white tracking-tighter leading-[0.9] uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">Gerçek<br /><span className="text-stone-600">Mobil Deneyim.</span></h1>
            <p className="text-stone-400 text-lg font-medium leading-relaxed max-w-md opacity-80">En yüksek performans ve konfor için bu uygulama mobil cihazlar için optimize edilmiştir.</p>
          </div>
          <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors duration-500">
            <div className="w-28 h-28 bg-white p-2.5 rounded-2xl shrink-0 flex items-center justify-center shadow-2xl"><Lucide.QrCode size={70} className="text-stone-900" /></div>
            <div className="space-y-1.5">
              <h3 className="text-white font-black text-lg uppercase tracking-wide">QR Kodu Okutun</h3>
              <p className="text-stone-500 text-sm leading-snug">Kameranızı açın ve kataloğa doğrudan cebinizden ulaşın.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 md:flex-none md:w-[650px] flex justify-center md:bg-black/40 md:backdrop-blur-md md:border-l md:border-white/10 z-10 md:overflow-y-auto custom-scrollbar">
        {/* THE DEVICE FRAME */}
        <div 
          className={`
            relative transition-all duration-700 ease-in-out 
            phone-frame-container
            md:rounded-[2.5rem] 
            md:shadow-[0_0_0_12px_#1c1917,0_0_0_13px_rgba(255,255,255,0.1),0_40px_100px_rgba(0,0,0,0.8)] 
            md:z-10 md:scale-[0.95] lg:scale-[1.05]
            md:my-24
            w-full min-h-screen 
            ${UI.layout.bodyBg}
          `}
          style={{ transformOrigin: 'top center' }}
        >
          {/* VIRTUAL HARDWARE */}
          <div className="hidden md:block">
            {/* Hardware Buttons */}
            <div className="absolute -left-[12px] top-32 w-[4px] h-10 bg-stone-800 rounded-l shadow-sm" />
            <div className="absolute -left-[12px] top-44 w-[4px] h-16 bg-stone-800 rounded-l shadow-sm" />
            <div className="absolute -right-[12px] top-40 w-[4px] h-20 bg-stone-800 rounded-r shadow-sm" />
          </div>

          {/* APPLICATION PORTAL */}
          <div className="phone-frame-content bg-transparent">
            {mobileContent}
            
            {/* Home Indicator (Desktop only) */}
            <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-stone-900/10 rounded-full z-[500] hover:bg-stone-900/20 transition-colors" />
          </div>
        </div>
      </div>
      <GlobalFeedbackOverlay />
    </div>
  );
}

function GlobalFeedbackOverlay() {
  const { status, message, hideFeedback } = useGlobalFeedback();
  return <StatusOverlay status={status as any} message={message} onClose={hideFeedback} />;
}

export default function App() {
  const currentSlug = getActiveStoreSlug();
  if (currentSlug === 'main-site') return <LandingPage />;
  return <CatalogView />;
}
