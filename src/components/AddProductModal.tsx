// FILE: src/components/AddProductModal.tsx
// ROLE: Renders the modal overlay form for adding new products to the catalog
// READS FROM: src/data/config, src/types
// USED BY: ProductGrid (or FloatingAdminMenu)

import React, { useState, memo, useCallback } from 'react';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import Button from './Button';

/**
 * ADD PRODUCT MODAL COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Orchestrates the product creation workflow. Fully managed via THEME.
 */

// ARCHITECTURE: AddProductModal
// PURPOSE: Collects user input (name, category, price, image) and triggers the `onProductAddition` callback
// DEPENDENCIES: Button, LABELS, THEME
// CONSUMERS: Renders conditionally when the admin wants to add a new product
interface AddProductModalProps {
  isModalOpen: boolean;
  availableCategories: string[];
  onProductAddition: (productData: Omit<Product, 'id' | 'is_archived'>, imageFile?: File) => void;
  onModalClose: () => void;
}

const INITIAL_FORM_STATE = {
  productName: '',
  selectedCategory: '',
  customCategoryName: '',
  productPrice: '',
  productDescription: '',
  selectedImageFile: null as File | null,
  isProductInStock: true,
};

// --- INTERNAL UI SUB-COMPONENTS ---

const FormInput = memo(({ labelText, ...inputProperties }: { labelText: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
  const theme = THEME.addProductModal;
  return (
    <div>
      <label className={theme.typography.label}>{labelText}</label>
      <input {...inputProperties} className={theme.inputField} />
    </div>
  );
});

const ProductImagePicker = memo(({ imagePreviewUrl, onFileSelectionChange }: { imagePreviewUrl: string | null, onFileSelectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const theme = THEME.addProductModal.imagePicker;
  return (
    <div className={theme.wrapper}>
      <div className={theme.frame}>
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt={LABELS.form.preview} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl text-stone-300">📷</span>
        )}
      </div>
      <Button 
        onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
        variant="secondary"
        mode="rectangle"
        size="sm"
        className="w-full !rounded-xl"
        icon={<span>📷</span>}
      >
        {LABELS.form.selectImage}
        <input type="file" accept="image/*" className="hidden" onChange={onFileSelectionChange} />
      </Button>
    </div>
  );
});

const ProductCategorySelector = memo(({ categories, currentSelection, customCategory, onCategorySelect, onCustomCategoryChange }: { 
  categories: string[], 
  currentSelection: string, 
  customCategory: string,
  onCategorySelect: (category: string) => void,
  onCustomCategoryChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = THEME.addProductModal;
  const visibleCategories = isExpanded ? categories : categories.slice(0, 4);

  return (
    <div>
      <label className={theme.typography.categoryLabel}>{LABELS.form.category}</label>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visibleCategories.map((category) => (
            <Button 
              key={category} 
              onClick={() => onCategorySelect(category)} 
              variant={currentSelection === category && !customCategory ? 'primary' : 'secondary'}
              mode="rectangle"
              size="sm"
              className="!text-[10px] !py-1 !px-2.5 !rounded-lg"
            >
              {category}
            </Button>
          ))}
          {categories.length > 4 && !isExpanded && (
            <Button 
              onClick={() => setIsExpanded(true)} 
              variant="ghost"
              mode="rectangle"
              size="sm"
              className="!text-[10px] !py-1 !px-2.5 !rounded-lg"
            >
              +{categories.length - 4} Daha
            </Button>
          )}
        </div>
      )}
      <input 
        name="customCategoryName" 
        type="text" 
        value={customCategory} 
        onChange={onCustomCategoryChange} 
        placeholder={LABELS.form.newCategoryPlaceholder} 
        className={`${theme.inputField} italic`} 
      />
    </div>
  );
});

export default function AddProductModal({
  isModalOpen,
  availableCategories = [],
  onProductAddition,
  onModalClose,
}: AddProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [temporaryImagePreviewUrl, setTemporaryImagePreviewUrl] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSubmittingData, setIsSubmittingData] = useState(false);

  const theme = THEME.addProductModal;

  const handleCloseAndReset = useCallback(() => {
    if (isSubmittingData) return;
    setFormState(INITIAL_FORM_STATE);
    setTemporaryImagePreviewUrl(null);
    setFormErrorMessage('');
    setCurrentStep(1);
    onModalClose();
  }, [isSubmittingData, onModalClose]);

  const handleFormInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState(previousState => ({ 
      ...previousState, 
      [name]: value,
      selectedCategory: name === 'customCategoryName' && value.trim() ? '' : previousState.selectedCategory 
    }));
    setFormErrorMessage('');
  }, []);

  const handleCategorySelection = useCallback((category: string) => {
    setFormState(previousState => ({ ...previousState, selectedCategory: category, customCategoryName: '' }));
  }, []);

  const handleImageFileSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFormState(previousState => ({ ...previousState, selectedImageFile: file }));
    const localUrl = URL.createObjectURL(file);
    setTemporaryImagePreviewUrl(localUrl);
  }, []);

  const handleProductSubmission = async () => {
    if (isSubmittingData) return;
    const finalizedCategory = formState.customCategoryName.trim() || formState.selectedCategory.trim();
    
    setIsSubmittingData(true);
    try {
      const { transformCurrencyStringToNumber, formatNumberToCurrency } = await import('../utils/price');
      const numericPrice = transformCurrencyStringToNumber(formState.productPrice);
      const standardizedPriceLabel = formatNumberToCurrency(numericPrice);

      await onProductAddition({
        name: formState.productName.trim(),
        category: finalizedCategory,
        price: standardizedPriceLabel,
        description: formState.productDescription.trim(),
        image: null,
        inStock: formState.isProductInStock,
      }, formState.selectedImageFile || undefined);
      handleCloseAndReset();
    } catch {
      setFormErrorMessage(LABELS.saveError);
    } finally {
      setIsSubmittingData(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const isStepValid = () => {
    if (currentStep === 2) return !!formState.productName.trim();
    if (currentStep === 4) return !!((formState.selectedCategory.trim() || formState.customCategoryName.trim()) && formState.productPrice.trim());
    return true;
  };

  if (!isModalOpen) return null;

  return (
    <div className={theme.overlay} role="dialog">
      <div className={theme.container} onClick={event => event.stopPropagation()}>
        
        <div className={theme.header}>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest">{LABELS.newProductBtn}</h2>
            <div className={theme.wizard.progressWrapper}>
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={`${theme.wizard.progressBase} ${currentStep >= step ? theme.wizard.stepActive : theme.wizard.stepInactive}`} />
              ))}
            </div>
          </div>
          <Button 
            onClick={handleCloseAndReset} 
            disabled={isSubmittingData} 
            icon={THEME.icons.close}
            variant="ghost"
            size="sm"
            className={theme.headerButton}
          />
        </div>

        <div className={theme.body}>
          {/* STEP 1: PHOTO */}
          {currentStep === 1 && (
            <div className={theme.wizard.stepContent}>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-stone-800">Ürün Fotoğrafı</h3>
                <p className="text-xs text-stone-500">Müşterilerinizin ürünü görmesi satışı artırır.</p>
              </div>
              <ProductImagePicker imagePreviewUrl={temporaryImagePreviewUrl} onFileSelectionChange={handleImageFileSelection} />
              <div className="flex gap-3">
                <Button onClick={nextStep} variant="secondary" className="flex-1" mode="rectangle">
                  {temporaryImagePreviewUrl ? 'İLERLE' : 'FOTOĞRAFSIZ DEVAM ET'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: NAME */}
          {currentStep === 2 && (
            <div className={theme.wizard.stepContent}>
              <FormInput 
                labelText={LABELS.form.productName} 
                name="productName" 
                value={formState.productName} 
                onChange={handleFormInputChange} 
                placeholder={LABELS.form.productNamePlaceholder} 
                autoFocus
              />
              <div className="flex gap-3">
                <Button onClick={prevStep} variant="ghost" className="flex-1" mode="rectangle">GERİ</Button>
                <Button onClick={nextStep} disabled={!formState.productName.trim()} variant="primary" className="flex-1" mode="rectangle">SONRAKİ</Button>
              </div>
            </div>
          )}

          {/* STEP 3: DESCRIPTION */}
          {currentStep === 3 && (
            <div className={theme.wizard.stepContent}>
              <div>
                <label className={theme.typography.label}>{LABELS.form.description}</label>
                <textarea 
                  name="productDescription" 
                  value={formState.productDescription} 
                  onChange={handleFormInputChange} 
                  rows={4} 
                  className={`${theme.inputField} resize-none block`} 
                  placeholder={LABELS.form.descriptionPlaceholder} 
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={prevStep} variant="ghost" className="flex-1" mode="rectangle">GERİ</Button>
                <Button onClick={nextStep} variant="primary" className="flex-1" mode="rectangle">
                  {formState.productDescription.trim() ? 'SONRAKİ' : 'GEÇ'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CATEGORY & PRICE & STOCK */}
          {currentStep === 4 && (
            <div className={theme.wizard.stepContent}>
              <div className={theme.stockToggle}>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wide" htmlFor="product-stock-checkbox">
                  {LABELS.form.stockStatus}
                </label>
                <input 
                  id="product-stock-checkbox" 
                  type="checkbox" 
                  checked={formState.isProductInStock} 
                  onChange={(e) => setFormState(p => ({ ...p, isProductInStock: e.target.checked }))} 
                  className={theme.checkbox} 
                />
              </div>

              <ProductCategorySelector 
                categories={availableCategories} 
                currentSelection={formState.selectedCategory} 
                customCategory={formState.customCategoryName} 
                onCategorySelect={handleCategorySelection} 
                onCustomCategoryChange={handleFormInputChange} 
              />

              <FormInput 
                labelText={LABELS.form.price} 
                name="productPrice" 
                value={formState.productPrice} 
                onChange={handleFormInputChange} 
                placeholder={LABELS.form.pricePlaceholder} 
              />

              <div className="flex gap-3">
                <Button onClick={prevStep} variant="ghost" className="flex-1" mode="rectangle">GERİ</Button>
                <Button onClick={nextStep} disabled={!isStepValid()} variant="primary" className="flex-1" mode="rectangle">ÖNİZLEME</Button>
              </div>
            </div>
          )}

          {/* STEP 5: PREVIEW & CONFIRM */}
          {currentStep === 5 && (
            <div className={theme.wizard.stepContent}>
              <div className="text-center space-y-1">
                <h3 className="font-bold text-stone-800">Son Kontrol</h3>
                <p className="text-xs text-stone-500">Ürününüz dükkanda böyle görünecek.</p>
              </div>

              {/* MINI PREVIEW CARD */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-stone-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {temporaryImagePreviewUrl ? <img src={temporaryImagePreviewUrl} className="w-full h-full object-cover" alt="preview" /> : <span className="text-2xl text-stone-400">📷</span>}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="font-bold text-stone-900 truncate">{formState.productName || 'İsimsiz Ürün'}</h4>
                    <p className="text-xs text-stone-500 line-clamp-1">{formState.productDescription || 'Açıklama yok'}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-kraft-600">{formState.productPrice || '0'}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-200 rounded-full text-stone-600 uppercase">
                        {formState.customCategoryName || formState.selectedCategory || 'Kategorisiz'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {formErrorMessage && <div className={theme.typography.errorBadge}>{formErrorMessage}</div>}

              <div className="flex gap-3">
                <Button onClick={prevStep} disabled={isSubmittingData} variant="ghost" className="flex-1" mode="rectangle">DÜZELT</Button>
                <Button 
                  onClick={handleProductSubmission}
                  disabled={isSubmittingData}
                  variant="primary" 
                  className="flex-1" 
                  mode="rectangle"
                  icon={isSubmittingData ? <div className={THEME.loading.spinner + " w-3.5 h-3.5"}></div> : null}
                >
                  {isSubmittingData ? 'EKLENİYOR...' : 'ONAYLA VE EKLE'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
