import { useRef, useState, useEffect, memo } from 'react';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import { resolveVisualAssetUrl, PLACEHOLDER_VISUAL_SYMBOL } from '../utils/image';
import { calculatePromotionalPrice } from '../utils/price';
import Button from './Button';
import { AdminActionMenu } from './AdminActionMenu';
import { MarqueeText } from './MarqueeText';

/**
 * PRODUCT CARD COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Managed via central THEME config. Orchestrates sub-components.
 */

interface ProductCardProps {
  product: Product;
  categories: string[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderChange?: (id: string, newPosition: number) => void;
  onImageUpload?: (id: string, file: File) => Promise<void>;
  orderIndex?: number;
  itemsInCategory?: number;
  activeDiscount?: any;
}

const ProductCard = memo(({
  product, 
  categories = [], 
  isAdmin, 
  onDelete, 
  onUpdate, 
  onOrderChange, 
  onImageUpload, 
  orderIndex = 1, 
  itemsInCategory = 1, 
  activeDiscount
}: ProductCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardContainerRef = useRef<HTMLElement>(null);

  const [hasImageError, setHasImageError] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [optimisticImagePreview, setOptimisticImagePreview] = useState<string | null>(null);
  const [isZoomDetailOpen, setIsZoomDetailOpen] = useState(false);

  const theme = THEME.productCard;
  const adminLabels = LABELS.adminActions;

  // Apple-style scroll to close behavior
  useEffect(() => {
    if (!isZoomDetailOpen) return;
    const handleScrollClose = () => setIsZoomDetailOpen(false);
    window.addEventListener('scroll', handleScrollClose, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollClose);
  }, [isZoomDetailOpen]);

  // Reset optimistic preview when real image arrives
  useEffect(() => {
    if (product.image && optimisticImagePreview) setOptimisticImagePreview(null);
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
    } catch (error) { 
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

  const isPromotionActive = activeDiscount && (!activeDiscount.category || activeDiscount.category === product.category);
  const currentPriceValue = isPromotionActive ? calculatePromotionalPrice(product.price, activeDiscount.rate) : product.price;
  const formattedPriceLabel = currentPriceValue.includes('₺') ? currentPriceValue : `${currentPriceValue} ₺`;

  const primaryImageSource = optimisticImagePreview || (product.image ? resolveVisualAssetUrl(product.image) : null);
  const highDefinitionImageSource = product.image ? resolveVisualAssetUrl(product.image.replace('/lq/', '/hq/').split('?')[0]) : null;

  const handleWhatsAppCustomerInquiry = () => {
    const storeWhatsAppNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const encodedMessage = encodeURIComponent(`Merhaba, *${product.name}* (${product.category}) ürününüz hakkında bilgi almak istiyorum.\n\nFiyat: ${formattedPriceLabel}`);
    window.open(`https://wa.me/${storeWhatsAppNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <>
      <article 
        ref={cardContainerRef as any} 
        data-product-id={product.id} 
        className={`${theme.container} ${THEME.radius.card} ${product.inStock === false ? theme.outOfStockBorder : theme.activeBorder} ${theme.shadow}`}
      >
        {/* ADMIN ORDER SELECTION PANEL */}
        <div className={`${theme.orderSelect.container} ${isAdmin ? theme.orderSelect.adminAnimation : theme.orderSelect.userAnimation}`}>
          <div className={`${theme.orderSelect.wrapper} ${THEME.radius.input}`}>
            <select 
              value={orderIndex} 
              onChange={(e) => onOrderChange?.(product.id, parseInt(e.target.value, 10))} 
              className={theme.orderSelect.select}
            >
              {Array.from({ length: itemsInCategory }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        </div>

        {/* IMAGE VISUAL SECTION */}
        <div 
          className={`${theme.image.wrapper} ${theme.image.aspect} ${theme.image.bg} ${THEME.radius.image} ${!isAdmin ? theme.image.cursorUser : theme.image.cursorAdmin}`} 
          onClick={() => { 
            if (isAdmin && !isUploadingImage) fileInputRef.current?.click(); 
            else if (!isAdmin && primaryImageSource) setIsZoomDetailOpen(true); 
          }}
        >
          {primaryImageSource && !hasImageError ? (
            <img 
              src={primaryImageSource} 
              alt={product.name} 
              onError={() => setHasImageError(true)} 
              className={`w-full h-full ${theme.image.fit} ${THEME.radius.image} ${theme.image.transition} ${product.inStock === false ? theme.image.outOfStock : ''} ${isUploadingImage ? theme.image.uploading : ''}`} 
              draggable={false} 
              loading={isZoomDetailOpen ? "eager" : "lazy"} 
            />
          ) : (
            <div className={theme.image.placeholderIcon}>
              <span>{PLACEHOLDER_VISUAL_SYMBOL}</span>
            </div>
          )}
          
          {isAdmin && primaryImageSource && !isUploadingImage && (
            <div className={theme.image.overlay} />
          )}

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
            editableProps={isAdmin ? { 
              contentEditable: true, 
              suppressContentEditableWarning: true, 
              onBlur: (event: any) => handleDataFieldUpdate('name', event.currentTarget.textContent?.trim() || ''), 
              onKeyDown: (event: any) => event.key === 'Enter' && (event.preventDefault(), event.currentTarget.blur()), 
              className: `${theme.typography.editable} ${theme.adminMenu.editHighlight} ${theme.adminMenu.editPadding} ${THEME.radius.input}` 
            } : {}} 
          />
          
          <div className={theme.innerLayout.descriptionWrapper}>
            {isAdmin ? (
              <div onClick={(event) => event.stopPropagation()} className={theme.adminMenu.textareaBase}>
                <textarea 
                  defaultValue={product.description || ''} 
                  onBlur={(event) => handleDataFieldUpdate('description', event.target.value.trim())} 
                  className={`${theme.typography.description} ${theme.adminMenu.editHighlight} border ${theme.adminMenu.editBorder} ${THEME.radius.input} ${theme.adminMenu.editPadding} ${theme.adminMenu.textareaBase}`} 
                  placeholder={adminLabels.addDescription}
                />
              </div>
            ) : (
              product.description && <p className={`${theme.typography.description} ${theme.typography.descriptionClamp}`}>{product.description}</p>
            )}
          </div>

          <div className={theme.innerLayout.footerWrapper}>
            <div 
              contentEditable={isAdmin} 
              suppressContentEditableWarning 
              onBlur={(event: any) => { 
                let inputPrice = event.currentTarget.textContent?.trim() || ''; 
                if (inputPrice && !inputPrice.startsWith('₺')) inputPrice = '₺' + inputPrice; 
                handleDataFieldUpdate('price', inputPrice); 
              }} 
              onKeyDown={(event: any) => event.key === 'Enter' && (event.preventDefault(), event.currentTarget.blur())} 
              className={`${theme.typography.price} ${isPromotionActive ? theme.typography.discountPrice : 'text-stone-900'} ${isAdmin ? `${theme.typography.editable} ${theme.adminMenu.editHighlight} ${theme.adminMenu.editPadding} ${THEME.radius.input}` : ''} ${product.inStock === false && !isAdmin ? theme.typography.priceOutOfStock : ''}`}
            >
              {formattedPriceLabel}
            </div>
          </div>
        </div>

        {/* ADMIN MANAGEMENT ACTIONS */}
        <div className={`${theme.innerLayout.adminActionsWrapper} ${isAdmin ? theme.innerLayout.adminActionsActive : theme.innerLayout.adminActionsInactive}`}>
          <AdminActionMenu product={product} categories={categories} onDelete={onDelete} onUpdate={onUpdate} />
        </div>

        {/* PRODUCT STATUS BADGES */}
        <div className={theme.status.wrapper}>
          {!product.inStock && (<div className={theme.status.badge}>🚫</div>)}
          {product.is_archived && (<div className={theme.status.badge}>📦</div>)}
        </div>
      </article>

      {/* EXPANDED DETAIL VIEW MODAL */}
      {isZoomDetailOpen && highDefinitionImageSource && (
        <div className={THEME.modal.overlay} onClick={() => setIsZoomDetailOpen(false)}>
          <div className={THEME.modal.closeButtonWrapper}>
            <Button 
              onClick={() => setIsZoomDetailOpen(false)} 
              icon={THEME.icons.close} 
              variant="secondary" 
              size="md" 
              mode="rectangle" 
              className={THEME.modal.closeButtonCustom} 
            />
          </div>
          
          <div className={THEME.modal.contentWrapper} onClick={event => event.stopPropagation()}>
            <div className={THEME.modal.imageWrapper}>
              <img 
                src={highDefinitionImageSource} 
                alt={product.name} 
                className={`${THEME.modal.image} ${THEME.radius.modal}`} 
              />
            </div>

            <div className={THEME.modal.contentWrapper}>
              <div className={THEME.modal.headerWrapper}>
                <span className={theme.typography.categoryBadge}>{product.category}</span>
                <h3 className={THEME.modal.title}>{product.name}</h3>
              </div>
              {product.description && <p className={THEME.modal.description}>{product.description}</p>}
              <div className={THEME.modal.actionArea}>
                <span className={`${THEME.modal.priceBadge} ${THEME.radius.badge}`}>
                  {formattedPriceLabel}
                </span>
                <Button 
                  onClick={handleWhatsAppCustomerInquiry} 
                  variant="whatsapp" 
                  mode="rectangle" 
                  size="lg" 
                  icon={THEME.icons.whatsapp}
                >
                  WHATSAPP'TAN SOR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ProductCard;
