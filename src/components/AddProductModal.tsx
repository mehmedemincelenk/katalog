import React, { useState, memo, useCallback } from 'react';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import Button from './Button';
import BaseModal from './BaseModal';
import { ArrowLeft } from 'lucide-react';

/**
 * ADD PRODUCT MODAL COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Orchestrates the product creation workflow. Fully managed via THEME.
 */

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
        className="mx-auto !rounded-xl px-8"
      >
        GALERİDEN SEÇ
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
  const theme = THEME.addProductModal;

  return (
    <div>
      <label className={theme.typography.categoryLabel}>{LABELS.form.category}</label>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categories.map((category) => (
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
    if (currentStep === 4) return !!(formState.selectedCategory.trim() || formState.customCategoryName.trim());
    if (currentStep === 5) return !!formState.productPrice.trim();
    return true;
  };

  if (!isModalOpen) return null;

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleCloseAndReset}
      title={LABELS.newProductBtn}
      progress={{ current: currentStep, total: 7 }}
      disableClickOutside={isSubmittingData}
      hideCloseButton={isSubmittingData}
    >
      <div className="space-y-6">
        {/* STEP 1: PHOTO */}
        {currentStep === 1 && (
          <div className={theme.wizard.stepContent}>
            <div className="text-center space-y-2 mb-6">
              <h3 className="font-bold text-stone-800">Ürün Fotoğrafı</h3>
            </div>
            <ProductImagePicker imagePreviewUrl={temporaryImagePreviewUrl} onFileSelectionChange={handleImageFileSelection} />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={handleCloseAndReset} variant="ghost" className="w-full" mode="rectangle">
                İPTAL
              </Button>
              <Button onClick={nextStep} variant="secondary" className="w-full" mode="rectangle">
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
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={prevStep} variant="ghost" className="w-full" mode="rectangle" icon={<ArrowLeft size={16}/>}>GERİ</Button>
              <Button onClick={nextStep} disabled={!formState.productName.trim()} variant="primary" className="w-full" mode="rectangle">SONRAKİ</Button>
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
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={prevStep} variant="ghost" className="w-full" mode="rectangle" icon={<ArrowLeft size={16}/>}>GERİ</Button>
              <Button onClick={nextStep} variant="primary" className="w-full" mode="rectangle">
                {formState.productDescription.trim() ? 'SONRAKİ' : 'GEÇ'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: CATEGORY */}
        {currentStep === 4 && (
          <div className={theme.wizard.stepContent}>
            <ProductCategorySelector 
              categories={availableCategories} 
              currentSelection={formState.selectedCategory} 
              customCategory={formState.customCategoryName} 
              onCategorySelect={handleCategorySelection} 
              onCustomCategoryChange={handleFormInputChange} 
            />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={prevStep} variant="ghost" className="w-full" mode="rectangle" icon={<ArrowLeft size={16}/>}>GERİ</Button>
              <Button onClick={nextStep} disabled={!isStepValid()} variant="primary" className="w-full" mode="rectangle">SONRAKİ</Button>
            </div>
          </div>
        )}

        {/* STEP 5: PRICE */}
        {currentStep === 5 && (
          <div className={theme.wizard.stepContent}>
            <FormInput 
              labelText={LABELS.form.price} 
              name="productPrice" 
              value={formState.productPrice} 
              onChange={handleFormInputChange} 
              placeholder={LABELS.form.pricePlaceholder} 
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={prevStep} variant="ghost" className="w-full" mode="rectangle" icon={<ArrowLeft size={16}/>}>GERİ</Button>
              <Button onClick={nextStep} disabled={!isStepValid()} variant="primary" className="w-full" mode="rectangle">SONRAKİ</Button>
            </div>
          </div>
        )}

        {/* STEP 6: STOCK */}
        {currentStep === 6 && (
          <div className={theme.wizard.stepContent}>
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-stone-800">Stok Durumu</span>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Ürün satışa hazır mı?</span>
              </div>
              
              <div className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 scale-110">
                 <button 
                   onClick={() => setFormState(p => ({ ...p, isProductInStock: true }))}
                   className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${formState.isProductInStock ? 'bg-green-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                   STOKTA
                 </button>
                 <button 
                   onClick={() => setFormState(p => ({ ...p, isProductInStock: false }))}
                   className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${!formState.isProductInStock ? 'bg-red-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                   YOK
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={prevStep} variant="ghost" className="w-full" mode="rectangle" icon={<ArrowLeft size={16}/>}>GERİ</Button>
              <Button onClick={nextStep} variant="primary" className="w-full" mode="rectangle">ÖNİZLEME</Button>
            </div>
          </div>
        )}

        {/* STEP 7: PREVIEW & CONFIRM */}
        {currentStep === 7 && (
          <div className={theme.wizard.stepContent}>
            <div className="text-center space-y-1 mb-6">
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

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={prevStep} disabled={isSubmittingData} variant="ghost" className="w-full" mode="rectangle" icon={<ArrowLeft size={16}/>}>GERİ</Button>
              <Button 
                onClick={handleProductSubmission}
                disabled={isSubmittingData}
                variant="primary" 
                className="w-full" 
                mode="rectangle"
                icon={isSubmittingData ? <div className={THEME.loading.spinner + " w-3.5 h-3.5"}></div> : null}
              >
                {isSubmittingData ? 'EKLENİYOR...' : 'ONAYLA'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
