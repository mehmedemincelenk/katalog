// FILE ROLE: Core Product Presentation Unit (Interactive Card)
// DEPENDS ON: THEME, Product Types, Admin Sub-menus, Animation Logic
// CONSUMED BY: ProductGrid.tsx
import { useRef, useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from './Loading';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import { resolveVisualAssetUrl } from '../utils/image';
import {
  standardizePriceInput,
  transformCurrencyStringToNumber,
  formatNumberToCurrency,
} from '../utils/price';
import { refineProductTexts } from '../utils/ai';
import Button from './Button';
import SmartImage from './SmartImage';
import { MarqueeText } from './MarqueeText';
import OrderSelector from './OrderSelector';
import BaseModal from './BaseModal';
import InfoHint from './InfoHint';
import AIStudioTextModal from './AIStudioTextModal';

/**
 * PRODUCT CARD COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Managed via central THEME config. Orchestrates sub-components.
 */

import { ProductCardProps } from '../types';

const ProductCard = memo(
  ({
    product,
    isAdmin,
    isInlineEnabled,
    showPrice = true,
    onUpdate,
    onOrderChange,
    onOrderIndexChange,
    onImageUpload,
    orderIndex = 1,
    itemsInCategory = 1,
    activeDiscount,
    setActiveAdminProductId,
    displayCurrency = 'TRY',
    exchangeRates,
  }: ProductCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardContainerRef = useRef<HTMLElement>(null);

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isOptimizingText, setIsOptimizingText] = useState(false);
    const [isTextModalOpen, setIsTextModalOpen] = useState(false);
    const [optimisticImagePreview, setOptimisticImagePreview] = useState<
      string | null
    >(null);
    const [isZoomDetailOpen, setIsZoomDetailOpen] = useState(false);

    const setIsAdminMenuOpen = (isOpen: boolean) => {
      setActiveAdminProductId?.(isOpen ? product.id : null);
    };

    const theme = THEME.productCard;
    const adminLabels = LABELS.adminActions;

    const handleAIOptimizeText = async () => {
      // 1. If we already have a suggestion in the cloud, reuse it instantly
      if (product.suggested_name && product.suggested_description) {
        setIsTextModalOpen(true);
        return;
      }

      // 2. Otherwise, call Diamond Studio
      setIsOptimizingText(true);
      try {
        const suggestions = await refineProductTexts(product);
        // Synchronize with cloud immediately so it's consistent across devices
        onUpdate(product.id, {
          suggested_name: suggestions.name,
          suggested_description: suggestions.description,
        });
        setIsTextModalOpen(true);
      } catch (err) {
        console.error('Text AI Error:', err);
      } finally {
        setIsOptimizingText(false);
      }
    };

    const handleConfirmTextSuggestion = (newName: string, newDesc: string) => {
      onUpdate(product.id, {
        name: newName,
        description: newDesc,
        text_polished_dismissed: true,
      });
      setIsTextModalOpen(false);
    };

    const handleDismissTextSuggestion = () => {
      onUpdate(product.id, { text_polished_dismissed: true });
      setIsTextModalOpen(false);
    };

    // Apple-style scroll to close behavior
    useEffect(() => {
      if (!isZoomDetailOpen) return;
      const handleScrollClose = () => setIsZoomDetailOpen(false);
      window.addEventListener('scroll', handleScrollClose, { passive: true });
      return () => window.removeEventListener('scroll', handleScrollClose);
    }, [isZoomDetailOpen]);

    // CLEANUP memory ONLY on unmount to prevent race conditions during upload transitions
    useEffect(() => {
      return () => {
        if (optimisticImagePreview) {
          URL.revokeObjectURL(optimisticImagePreview);
        }
      };
    }, [optimisticImagePreview]);

    // When real image arrives, just clear the preview state (revocation stays in cleanup)
    useEffect(() => {
      if (product.image_url && optimisticImagePreview) {
        setOptimisticImagePreview(null);
      }
    }, [product.image_url, optimisticImagePreview]);

    const handleImageFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile || !onImageUpload) return;

      const localPreviewUrl = URL.createObjectURL(selectedFile);
      setOptimisticImagePreview(localPreviewUrl);
      setIsUploadingImage(true);

      try {
        await onImageUpload(product.id, selectedFile);
      } catch {
        alert(LABELS.saveError);
        setOptimisticImagePreview(null);
      } finally {
        setIsUploadingImage(false);
        event.target.value = '';
      }
    };

    const handleDataFieldUpdate = (
      fieldName: keyof Product,
      newValue: string | boolean | null,
    ) => {
      if (newValue !== (product[fieldName] || '')) {
        onUpdate(product.id, { [fieldName]: newValue });
      }
    };

    const handlePromptEdit = (field: keyof Product, label: string) => {
      if (!isAdmin || isInlineEnabled) return;
      const currentVal = (product[field] as string) || '';
      const newVal = window.prompt(`${label} düzenle:`, currentVal);
      if (newVal !== null) {
        handleDataFieldUpdate(
          field,
          field === 'price' ? standardizePriceInput(newVal) : newVal,
        );
      }
    };

    // DISCOUNT & CURRENCY CALCULATION
    const isPromotionActive =
      activeDiscount &&
      (!activeDiscount.category ||
        activeDiscount.category === product.category);
    const baseMathematicalPrice = transformCurrencyStringToNumber(
      product.price,
    );

    const originalPriceLabel = formatNumberToCurrency(
      baseMathematicalPrice,
      displayCurrency,
      exchangeRates,
    );

    const discountedPriceLabel =
      isPromotionActive && baseMathematicalPrice > 0
        ? formatNumberToCurrency(
            baseMathematicalPrice * (1 - activeDiscount.rate),
            displayCurrency,
            exchangeRates,
          )
        : null;

    const primaryImageSource =
      optimisticImagePreview ||
      (product.image_url ? resolveVisualAssetUrl(product.image_url) : null);
    const highDefinitionImageSource = product.image_url
      ? resolveVisualAssetUrl(
          product.image_url.replace('/lq/', '/hq/').split('?')[0],
        )
      : null;

    return (
      <>
        <article
          ref={cardContainerRef}
          data-product-id={product.id}
          className={`${theme.container} ${THEME.radius.card} h-fit flex-shrink-0 overflow-hidden ${product.out_of_stock ? theme.outOfStockBorder : theme.activeBorder} ${theme.shadow}`}
        >
          {/* IMAGE VISUAL SECTION - SHARP CORNERS */}
          <div
            className={`${theme.image.wrapper} w-full overflow-hidden ${theme.image.bg} rounded-t-[inherit] rounded-b-none ${!isAdmin ? theme.image.cursorUser : theme.image.cursorAdmin}`}
            style={{
              aspectRatio: '1/1',
              flexShrink: 0,
            }}
            onClick={() => {
              if (isAdmin && !isUploadingImage && !isOptimizingText)
                setIsAdminMenuOpen(true);
              else if (!isAdmin && primaryImageSource)
                setIsZoomDetailOpen(true);
            }}
          >
            <SmartImage
              src={primaryImageSource}
              alt={product.name}
              aspectRatio="square"
              objectFit={
                theme.image.fit === 'object-cover' ? 'cover' : 'contain'
              }
              className={`
              w-full h-full rounded-none ${theme.image.transition} 
              ${product.out_of_stock ? theme.image.outOfStock : ''} 
              ${isUploadingImage ? 'opacity-20 blur-sm' : ''}
            `}
            />

            {/* LOADING OVERLAY (ONLY FOR UPLOADS) */}
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Loading size="sm" label="" variant="white" />
              </div>
            )}

            {/* ADMIN TOOLS CLUSTER (Z-Indexed area) */}
            <AnimatePresence>
              {isAdmin && (
                <motion.div
                  key="admin-actions"
                  initial={false}
                  animate={{ opacity: 1, scale: 1, transform: 'translateZ(0)' }}
                  exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-[50] pointer-events-none"
                >
                  {/* TOP-RIGHT CLUSTER: Order Index & Advice Notifications */}
                  <div
                    className="absolute top-2 right-2 z-[30] pointer-events-auto flex flex-col items-end gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-row-reverse items-center gap-1.5">
                      <OrderSelector
                        currentOrder={orderIndex}
                        totalCount={itemsInCategory}
                        onChange={(newPos) =>
                          onOrderChange?.(product.id, newPos)
                        }
                        onIndexChange={(newIdx) =>
                          onOrderIndexChange?.(product.id, newIdx)
                        }
                        className="shadow-xl"
                      />

                      {/* AI ADVICE CLUSTER: PHOTO & TEXT */}
                      <div className="flex flex-col items-end gap-1.5">
                        {/* 1. PHOTO ADVICE (POLISHED IMAGE) */}
                        {product.polished_image_url &&
                          !product.polished_ready_dismissed &&
                          !product.is_polished_pending &&
                          !isUploadingImage && (
                            <Button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                window.__ekatalog_openAIStudioCompare?.(
                                  product.id,
                                );
                              }}
                              variant="primary"
                              mode="circle"
                              size="sm"
                              className="!w-6 !h-6 !p-0 !bg-stone-900 border !border-white/20 shadow-xl animate-bounce-subtle !text-amber-400"
                              title="Görsel Tavsiyesi Hazır!"
                              icon={
                                <div className="w-4 h-4">{THEME.icons.ai}</div>
                              }
                            />
                          )}

                        {/* 2. TEXT ADVICE (SUGGESTED NAME/DESC) */}
                        {product.suggested_name &&
                          !product.text_polished_dismissed &&
                          !isOptimizingText && (
                            <Button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleAIOptimizeText();
                              }}
                              variant="primary"
                              mode="circle"
                              size="sm"
                              className="!w-6 !h-6 !p-0 !bg-stone-900 border !border-white/20 shadow-xl animate-pulse !text-amber-400"
                              title="Metin Tavsiyesi Hazır!"
                              icon={
                                <div className="w-4 h-4">{THEME.icons.ai}</div>
                              }
                            />
                          )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM-RIGHT ACTIONS: Info Hint Only */}
                  <div
                    className="pointer-events-auto absolute bottom-2 right-2 flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <InfoHint
                      message="Vitrin sırası ve tasarım tavsiyeleri için üst ikonları, ürünü yönetmek için kartın üzerini kullanabilirsiniz."
                      position="top"
                      className="mb-0.5 shadow-xl opacity-50 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
          </div>

          {/* TEXTUAL CONTENT SECTION */}
          <div
            className={`${theme.padding} ${theme.innerLayout.contentWrapper}`}
          >
            <MarqueeText
              text={product.name}
              textClass={`${theme.typography.name} ${theme.typography.nameTransition} ${product.out_of_stock ? theme.typography.nameOutOfStock : ''}`}
              isAdmin={isAdmin}
              onClick={() => handlePromptEdit('name', 'Ürün Adı')}
              editableProps={
                isAdmin && isInlineEnabled
                  ? {
                      contentEditable: true,
                      suppressContentEditableWarning: true,
                      onBlur: (event: React.FocusEvent<HTMLDivElement>) =>
                        handleDataFieldUpdate(
                          'name',
                          event.currentTarget.textContent?.trim() || '',
                        ),
                      onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) =>
                        event.key === 'Enter' &&
                        (event.preventDefault(), event.currentTarget.blur()),
                      className: `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text`,
                    }
                  : {}
              }
            />

            <div className={theme.innerLayout.descriptionWrapper}>
              {isAdmin && isInlineEnabled ? (
                <div
                  onClick={(event) => event.stopPropagation()}
                  className={theme.adminMenu.textareaBase}
                >
                  <textarea
                    defaultValue={product.description || ''}
                    onBlur={(event) =>
                      handleDataFieldUpdate(
                        'description',
                        event.target.value.trim(),
                      )
                    }
                    onChange={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className={`${theme.typography.description} outline-none w-full px-1 -mx-1 rounded transition-all hover:bg-stone-100 focus:bg-stone-100 focus:ring-2 focus:ring-stone-900/10 border-transparent bg-transparent resize-none overflow-hidden`}
                    placeholder={adminLabels.addDescription}
                    rows={1}
                  />
                </div>
              ) : (
                (product.description || isAdmin) && (
                  <p
                    onClick={() =>
                      handlePromptEdit('description', 'Ürün Açıklaması')
                    }
                    className={`${theme.typography.description} ${theme.typography.descriptionClamp} ${isAdmin ? `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text` : ''}`}
                  >
                    {product.description ||
                      (isAdmin ? adminLabels.addDescription : '')}
                  </p>
                )
              )}
            </div>

            {/* PRICE AREA: Hidden for everyone when showPrice is off */}
            {showPrice && (
              <div className={theme.innerLayout.footerWrapper}>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[20px]">
                  {isPromotionActive && !isAdmin ? (
                    <>
                      <span
                        className={`${theme.typography.price} text-stone-400 line-through text-[0.625rem] sm:text-[0.6875rem]`}
                      >
                        {originalPriceLabel}
                      </span>
                      <span
                        className={`${theme.typography.price} text-green-600`}
                      >
                        {discountedPriceLabel}
                      </span>
                    </>
                  ) : (
                    <div
                      contentEditable={isAdmin && isInlineEnabled}
                      suppressContentEditableWarning
                      onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
                        const inputPrice =
                          event.currentTarget.textContent?.trim() || '';
                        handleDataFieldUpdate(
                          'price',
                          standardizePriceInput(inputPrice),
                        );
                      }}
                      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) =>
                        event.key === 'Enter' &&
                        (event.preventDefault(), event.currentTarget.blur())
                      }
                      onClick={() => handlePromptEdit('price', 'Ürün Fiyatı')}
                      className={`${theme.typography.price} ${isAdmin ? `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text` : 'text-stone-900'} ${product.out_of_stock && !isAdmin ? theme.typography.priceOutOfStock : ''}`}
                    >
                      {originalPriceLabel}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STATUS BADGES */}
          <div className={theme.status.wrapper}>
            {product.out_of_stock && (
              <div className={theme.status.outOfStockLabel}>TÜKENDİ</div>
            )}
            {product.is_archived && (
              <div className={theme.status.badge}>📦</div>
            )}
          </div>
        </article>

        <BaseModal
          isOpen={isZoomDetailOpen}
          onClose={() => setIsZoomDetailOpen(false)}
          maxWidth="max-w-lg"
          className="!p-0 overflow-hidden"
          hideCloseButton={false}
        >
          <div className="-m-6 flex flex-col">
            {highDefinitionImageSource && (
              <div className="relative aspect-[4/3] bg-stone-50 overflow-hidden">
                <img
                  src={highDefinitionImageSource}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* PRODUCT INFO & ACTIONS - LEFT ALIGNED */}
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-left">
                <div className="mb-3">
                  <span className="bg-stone-100 text-stone-500 px-3 py-1.5 rounded-full text-[0.625rem] font-black uppercase tracking-widest inline-block border border-stone-200">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tighter leading-none">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-stone-500 text-xs sm:text-sm font-medium leading-relaxed max-w-full">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="pt-4 flex flex-col items-start gap-2">
                <div className="flex flex-col items-start">
                  {isPromotionActive ? (
                    <div className="flex items-center gap-3">
                      <span className="text-stone-300 line-through text-sm font-bold">
                        {originalPriceLabel}
                      </span>
                      <span className="text-green-600 text-2xl font-black tracking-tighter">
                        {discountedPriceLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="text-stone-900 text-2xl font-black tracking-tighter">
                      {originalPriceLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </BaseModal>

        <AIStudioTextModal
          isOpen={isTextModalOpen}
          onClose={() => setIsTextModalOpen(false)}
          product={product}
          suggestedName={product.suggested_name || ''}
          suggestedDescription={product.suggested_description || ''}
          onConfirm={handleConfirmTextSuggestion}
          onDismiss={handleDismissTextSuggestion}
          displayCurrency={displayCurrency}
          exchangeRates={exchangeRates}
        />
      </>
    );
  },
);

export default ProductCard;
