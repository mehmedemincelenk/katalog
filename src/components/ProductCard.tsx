// FILE ROLE: Core Product Presentation Unit (Interactive Card)
// DEPENDS ON: THEME, Product Types, Admin Sub-menus, Animation Logic
// CONSUMED BY: ProductGrid.tsx
import { useRef, useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import { resolveVisualAssetUrl, PLACEHOLDER_VISUAL_SYMBOL } from '../utils/image';
import { calculatePromotionalPrice, standardizePriceInput, transformCurrencyStringToNumber, formatNumberToCurrency } from '../utils/price';
import Button from './Button';
import { AdminActionMenu } from './AdminActionMenu';
import { MarqueeText } from './MarqueeText';
import { ActiveDiscount } from '../hooks/useDiscount';
import OrderSelector from './OrderSelector';
import BaseModal from './BaseModal';
import InfoHint from './InfoHint';

/**
 * PRODUCT CARD COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Managed via central THEME config. Orchestrates sub-components.
 */

interface ProductCardProps {
  product: Product;
  categories: string[];
  isAdmin: boolean;
  isInlineEnabled: boolean;
  showPrice?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderChange?: (id: string, newPosition: number) => void;
  onOrderIndexChange?: (id: string, newIndex: number) => void;
  onImageUpload?: (id: string, file: File) => Promise<string | undefined>;
  orderIndex?: number;
  itemsInCategory?: number;
  activeDiscount?: ActiveDiscount | null;
  isPriority?: boolean;
  activeAdminProductId?: string | null;
  setActiveAdminProductId?: (id: string | null) => void;
  displayCurrency?: 'TRY' | 'USD' | 'EUR';
  exchangeRates?: { usd: number; eur: number };
}

const ProductCard = memo(({
  product, 
  categories = [], 
  isAdmin, 
  isInlineEnabled,
  showPrice = true,
  onDelete, 
  onUpdate, 
  onOrderChange, 
  onOrderIndexChange,
  onImageUpload, 
  orderIndex = 1, 
  itemsInCategory = 1, 
  activeDiscount,
  isPriority = false,
  activeAdminProductId,
  setActiveAdminProductId,
  displayCurrency = 'TRY',
  exchangeRates
}: ProductCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardContainerRef = useRef<HTMLElement>(null);

  const [hasImageError, setHasImageError] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [optimisticImagePreview, setOptimisticImagePreview] = useState<string | null>(null);
  const [isZoomDetailOpen, setIsZoomDetailOpen] = useState(false);

  const isAdminMenuOpen = activeAdminProductId === product.id;
  const setIsAdminMenuOpen = (isOpen: boolean) => {
    setActiveAdminProductId?.(isOpen ? product.id : null);
  };

  const theme = THEME.productCard;
  const adminLabels = LABELS.adminActions;

  // Apple-style scroll to close behavior
  useEffect(() => {
    if (!isZoomDetailOpen) return;
    const handleScrollClose = () => setIsZoomDetailOpen(false);
    window.addEventListener('scroll', handleScrollClose, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollClose);
  }, [isZoomDetailOpen]);

  // Reset optimistic preview when real image arrives & CLEANUP memory
  useEffect(() => {
    if (product.image && optimisticImagePreview) {
      URL.revokeObjectURL(optimisticImagePreview);
      setOptimisticImagePreview(null);
    }
    // Cleanup on unmount
    return () => {
      if (optimisticImagePreview) URL.revokeObjectURL(optimisticImagePreview);
    };
  }, [product.image, optimisticImagePreview]);

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !onImageUpload) return;
    
    const localPreviewUrl = URL.createObjectURL(selectedFile);
    setOptimisticImagePreview(localPreviewUrl);
    setIsUploadingImage(true);
    setHasImageError(false);
    
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

  const handleDataFieldUpdate = (fieldName: keyof Product, newValue: string | boolean | null) => {
    if (newValue !== (product[fieldName] || '')) {
      onUpdate(product.id, { [fieldName]: newValue });
    }
  };

  const handlePromptEdit = (field: keyof Product, label: string) => {
    if (!isAdmin || isInlineEnabled) return;
    const currentVal = (product[field] as string) || '';
    const newVal = window.prompt(`${label} düzenle:`, currentVal);
    if (newVal !== null) {
      handleDataFieldUpdate(field, field === 'price' ? standardizePriceInput(newVal) : newVal);
    }
  };

  // DISCOUNT & CURRENCY CALCULATION
  const isPromotionActive = activeDiscount && (!activeDiscount.category || activeDiscount.category === product.category);
  const baseMathematicalPrice = transformCurrencyStringToNumber(product.price);
  
  const originalPriceLabel = formatNumberToCurrency(baseMathematicalPrice, displayCurrency, exchangeRates);
  
  const discountedPriceLabel = isPromotionActive && baseMathematicalPrice > 0 
    ? formatNumberToCurrency(baseMathematicalPrice * (1 - activeDiscount.rate), displayCurrency, exchangeRates) 
    : null;

  const primaryImageSource = optimisticImagePreview || (product.image ? resolveVisualAssetUrl(product.image) : null);
  const highDefinitionImageSource = product.image ? resolveVisualAssetUrl(product.image.replace('/lq/', '/hq/').split('?')[0]) : null;

  return (
    <>
      <article 
        ref={cardContainerRef} 
        data-product-id={product.id} 
        className={`${theme.container} ${THEME.radius.card} ${product.inStock === false ? theme.outOfStockBorder : theme.activeBorder} ${theme.shadow}`}
      >
        {/* IMAGE VISUAL SECTION - SHARP CORNERS */}
        <div 
          className={`${theme.image.wrapper} ${theme.image.aspect} ${theme.image.bg} rounded-none ${!isAdmin ? theme.image.cursorUser : theme.image.cursorAdmin}`} 
          onClick={() => { 
            if (isAdmin && !isUploadingImage) setIsAdminMenuOpen(true); 
            else if (!isAdmin && primaryImageSource) setIsZoomDetailOpen(true); 
          }}
        >
          {primaryImageSource && !hasImageError ? (
            <img 
              src={primaryImageSource} 
              alt={product.name} 
              onError={() => setHasImageError(true)} 
              className={`w-full h-full ${theme.image.fit} rounded-none ${theme.image.transition} ${product.inStock === false ? theme.image.outOfStock : ''} ${isUploadingImage ? theme.image.uploading : ''}`} 
              draggable={false} 
              loading={isPriority || isZoomDetailOpen ? "eager" : "lazy"} 
              {...(isPriority ? { fetchpriority: "high" } : {})}
            />
          ) : (
            <div className={`${theme.image.placeholderIcon} absolute inset-0 flex items-center justify-center`}>
              <span>{PLACEHOLDER_VISUAL_SYMBOL}</span>
            </div>
          )}
          
          <AnimatePresence>
            {isAdmin && primaryImageSource && !isUploadingImage && (
              <motion.div 
                initial={false} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                className={theme.image.overlay} 
              />
            )}
          </AnimatePresence>

          {/* ADMIN TOOLS: Repositioned logic */}
          <AnimatePresence>
            {isAdmin && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, scale: 1, transform: 'translateZ(0)' }}
                exit={{ opacity: 0, filter: 'blur(12px)', scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-[30] pointer-events-none"
              >
                <div className="absolute top-2 right-2 z-[30] pointer-events-auto flex flex-col items-end gap-1">
                  <OrderSelector 
                    currentOrder={orderIndex}
                    totalCount={itemsInCategory}
                    onChange={(newPos) => onOrderChange?.(product.id, newPos)}
                    onIndexChange={(newIdx) => onOrderIndexChange?.(product.id, newIdx)}
                    className="shadow-xl"
                  />
                  <InfoHint 
                    message="Bu numara ürünün reyonundaki vitrin sırasıdır. Değiştirdiğinizde ürün dükkanda yeni yerine kayar." 
                    position="bottom"
                    className="mr-1"
                  />
                </div>
                <div className="pointer-events-auto">
                  <AdminActionMenu 
                    product={product} 
                    categories={categories} 
                    onDelete={onDelete} 
                    onUpdate={onUpdate} 
                    isOpen={isAdminMenuOpen}
                    setIsOpen={setIsAdminMenuOpen}
                    onImageChangeClick={() => fileInputRef.current?.click()}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isUploadingImage && (
            <div className={theme.uploadOverlay.wrapper}>
              <div className={theme.uploadOverlay.spinner}></div>
              <span className={theme.uploadOverlay.label}>YÜKLENİYOR</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
        </div>

        {/* TEXTUAL CONTENT SECTION */}
        <div className={`${theme.padding} ${theme.innerLayout.contentWrapper}`}>
          <MarqueeText 
            text={product.name} 
            textClass={`${theme.typography.name} ${theme.typography.nameTransition} ${product.inStock === false ? theme.typography.nameOutOfStock : ''}`} 
            isAdmin={isAdmin} 
            onClick={() => handlePromptEdit('name', 'Ürün Adı')}
            editableProps={isAdmin && isInlineEnabled ? { 
              contentEditable: true, 
              suppressContentEditableWarning: true, 
              onBlur: (event: React.FocusEvent<HTMLDivElement>) => handleDataFieldUpdate('name', event.currentTarget.textContent?.trim() || ''), 
              onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => event.key === 'Enter' && (event.preventDefault(), event.currentTarget.blur()), 
              className: `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text` 
            } : {}} 
          />
          
          <div className={theme.innerLayout.descriptionWrapper}>
            {isAdmin && isInlineEnabled ? (
              <div onClick={(event) => event.stopPropagation()} className={theme.adminMenu.textareaBase}>
                <textarea 
                  defaultValue={product.description || ''} 
                  onBlur={(event) => handleDataFieldUpdate('description', event.target.value.trim())} 
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
                  onClick={() => handlePromptEdit('description', 'Ürün Açıklaması')}
                  className={`${theme.typography.description} ${theme.typography.descriptionClamp} ${isAdmin ? `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text` : ''}`}
                >
                  {product.description || (isAdmin ? adminLabels.addDescription : '')}
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
                    <span className={`${theme.typography.price} text-stone-400 line-through text-[10px] sm:text-[11px]`}>
                      {originalPriceLabel}
                    </span>
                    <span className={`${theme.typography.price} text-green-600`}>
                      {discountedPriceLabel}
                    </span>
                  </>
                ) : (
                  <div 
                    contentEditable={isAdmin && isInlineEnabled} 
                    suppressContentEditableWarning 
                    onBlur={(event: React.FocusEvent<HTMLDivElement>) => { 
                      const inputPrice = event.currentTarget.textContent?.trim() || ''; 
                      handleDataFieldUpdate('price', standardizePriceInput(inputPrice)); 
                    }} 
                    onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => event.key === 'Enter' && (event.preventDefault(), event.currentTarget.blur())} 
                    onClick={() => handlePromptEdit('price', 'Ürün Fiyatı')}
                    className={`${theme.typography.price} ${isAdmin ? `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text` : 'text-stone-900'} ${product.inStock === false && !isAdmin ? theme.typography.priceOutOfStock : ''}`}
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
          {!product.inStock && (
            <div className={theme.status.outOfStockLabel}>
              TÜKENDİ
            </div>
          )}
          {product.is_archived && (<div className={theme.status.badge}>📦</div>)}
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
          {/* PRODUCT VISUAL */}
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
                <span className="bg-stone-100 text-stone-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-stone-200">
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
                    <span className="text-stone-300 line-through text-sm font-bold">{originalPriceLabel}</span>
                    <span className="text-green-600 text-2xl font-black tracking-tighter">{discountedPriceLabel}</span>
                  </div>
                ) : (
                  <span className="text-stone-900 text-2xl font-black tracking-tighter">{originalPriceLabel}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  );
});

export default ProductCard;
