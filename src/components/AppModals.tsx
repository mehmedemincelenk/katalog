import { memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import AddProductModal from './AddProductModal';
import BulkPriceUpdateModal from './BulkPriceUpdateModal';
import PinModal from './PinModal';
import QRModal from './QRModal';
import DisplaySettingsModal from './DisplaySettingsModal';
import CouponModal from './CouponModal';
import PriceListModal from './PriceListModal';
import GlobalAddMenuModal from './GlobalAddMenuModal';
import AIStudioCompareModal from './AIStudioCompareModal';

import { AppModalsProps } from '../types';

/**
 * APP MODALS CONTAINER (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Centralizes all global application modals to keep App.tsx clean.
 * Leverages AnimatePresence for smooth transitions.
 */
const AppModals = memo(
  ({
    isAdmin,
    settings,
    categoryOrder,
    allProducts,

    // Modal States
    isAddModalOpen,
    setIsAddModalOpen,
    isBulkUpdateModalOpen,
    setIsBulkUpdateModalOpen,
    isDisplaySettingsOpen,
    setIsDisplaySettingsOpen,
    isQRModalOpen,
    setIsQRModalOpen,
    isPinModalOpen,
    setIsPinModalOpen,
    isCouponModalOpen,
    setIsCouponModalOpen,
    isPriceListModalOpen,
    setIsPriceListModalOpen,
    isGlobalAddMenuOpen,
    setIsGlobalAddMenuOpen,
    aiStudioProduct,
    setAiStudioProduct,
    pendingAddCategory,
    setPendingAddCategory,

    // Action Handlers
    addProduct,
    uploadImage,
    updateProduct,
    updateSetting,
    executeGranularBulkActions,
    handleGlobalAddAction,

    // Admin / Auth Logic
    verifyPinWithServer,
    onPinSuccess,
    isLockedOut,
    failedAttempts,
    isInlineEnabled,
    toggleInlineEdit,

    // Marketing / Price Logic
    applyCode,
    activeDiscount,
    discountError,
    displayCurrency,
  }: AppModalsProps) => {
    return (
      <>
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />

        <AnimatePresence>
          {isAdmin && (
            <>
              <AddProductModal
                isModalOpen={isAddModalOpen}
                onModalClose={() => {
                  setIsAddModalOpen(false);
                  setPendingAddCategory(undefined);
                }}
                onProductAddition={async (data, file) => {
                  const newId = await addProduct(data);
                  if (file && newId) {
                    await uploadImage({ id: newId, file });
                  }
                }}
                availableCategories={categoryOrder}
                initialCategory={pendingAddCategory}
              />

              <BulkPriceUpdateModal
                isOpen={isBulkUpdateModalOpen}
                onClose={() => setIsBulkUpdateModalOpen(false)}
                allProducts={allProducts}
                categories={categoryOrder}
                onGranularUpdate={executeGranularBulkActions}
              />

              {settings && (
                <DisplaySettingsModal
                  key={isDisplaySettingsOpen ? 'active' : 'inactive'}
                  isOpen={isDisplaySettingsOpen}
                  onClose={() => setIsDisplaySettingsOpen(false)}
                  settings={settings}
                  updateSetting={updateSetting}
                  isInlineEnabled={isInlineEnabled}
                  onToggleInline={toggleInlineEdit}
                />
              )}

              <GlobalAddMenuModal
                isOpen={isGlobalAddMenuOpen}
                onClose={() => setIsGlobalAddMenuOpen(false)}
                onAction={handleGlobalAddAction}
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
          key={isCouponModalOpen ? 'active' : 'inactive'}
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          onApplyDiscount={applyCode}
          activeDiscount={activeDiscount}
          discountError={discountError}
        />

        {settings && (
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
        )}

        <AIStudioCompareModal
          isOpen={!!aiStudioProduct}
          product={aiStudioProduct}
          onClose={() => setAiStudioProduct(null)}
          onApply={(productId, polishedUrl) => {
            updateProduct({
              id: productId,
              changes: {
                image_url: polishedUrl,
                polished_ready_dismissed: true,
              },
            });
            setAiStudioProduct(null);
          }}
          onDismiss={(productId) => {
            updateProduct({
              id: productId,
              changes: { polished_ready_dismissed: true },
            });
            setAiStudioProduct(null);
          }}
        />
      </>
    );
  },
);

export default AppModals;
