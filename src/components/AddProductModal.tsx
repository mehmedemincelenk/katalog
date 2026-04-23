import React, { useState, memo, useCallback, useRef } from 'react';
import { LABELS, THEME } from '../data/config';
import Button from './Button';
import BaseModal from './BaseModal';
import StatusToggle from './StatusToggle';
import ProductCardUI from './ProductCardUI';
import { ArrowLeft } from 'lucide-react';

/**
 * ADD PRODUCT MODAL COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Orchestrates the product creation workflow. Fully managed via THEME.
 */

import {
  AddProductModalProps,
  FormInputProps,
  ProductImagePickerProps,
  ProductCategorySelectorProps,
} from '../types';
import { useStore } from '../store/useStore';

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

const FormInput = memo(
  ({ labelText, id, ...inputProperties }: FormInputProps) => {
    const theme = THEME.addProductModal;
    return (
      <div>
        <label htmlFor={id} className={theme.typography.label}>
          {labelText}
        </label>
        <input id={id} {...inputProperties} className={theme.inputField} />
      </div>
    );
  },
);

const ProductImagePicker = memo(
  ({ imagePreviewUrl, onFileSelectionChange }: ProductImagePickerProps) => {
    const theme = THEME.addProductModal.imagePicker;
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <div className={theme.wrapper}>
        <div className={theme.frame}>
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt={LABELS.form.preview}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-stone-300">📷</span>
          )}
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          mode="rectangle"
          size="sm"
          className="mx-auto !rounded-xl px-8"
        >
          GALERİDEN SEÇ
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelectionChange}
          />
        </Button>
      </div>
    );
  },
);

const ProductCategorySelector = memo(
  ({
    categories,
    currentSelection,
    customCategory,
    onCategorySelect,
    onCustomCategoryChange,
  }: ProductCategorySelectorProps) => {
    const theme = THEME.addProductModal;

    return (
      <div>
        <label className={theme.typography.categoryLabel}>
          {LABELS.form.category}
        </label>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => onCategorySelect(category)}
                variant={
                  currentSelection === category && !customCategory
                    ? 'primary'
                    : 'secondary'
                }
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
  },
);

export default function AddProductModal({
  isModalOpen,
  availableCategories = [],
  onProductAddition,
  onModalClose,
  initialCategory,
}: AddProductModalProps) {
  const { settings } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [temporaryImagePreviewUrl, setTemporaryImagePreviewUrl] = useState<
    string | null
  >(null);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const theme = THEME.addProductModal;

  // Effect: Handle initial category sync and cleanup memory leaks from image previews
  React.useEffect(() => {
    if (isModalOpen && initialCategory) {
      setFormState((prev) => ({
        ...prev,
        selectedCategory: initialCategory,
        customCategoryName: '',
      }));
    }

    // Cleanup: Memory leak prevention (revoking temporary image URLs)
    return () => {
      if (temporaryImagePreviewUrl) {
        URL.revokeObjectURL(temporaryImagePreviewUrl);
      }
    };
  }, [isModalOpen, initialCategory, temporaryImagePreviewUrl]);

  const handleCloseAndReset = useCallback(() => {
    if (isSubmittingData) return;

    // Direct cleanup for the preview URL before resting state
    if (temporaryImagePreviewUrl) {
      URL.revokeObjectURL(temporaryImagePreviewUrl);
    }

    setFormState(INITIAL_FORM_STATE);
    setTemporaryImagePreviewUrl(null);
    setFormErrorMessage('');
    setCurrentStep(1);
    onModalClose();
  }, [isSubmittingData, onModalClose, temporaryImagePreviewUrl]);

  const handleFormInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setFormState((previousState) => ({
        ...previousState,
        [name]: value,
        selectedCategory:
          name === 'customCategoryName' && value.trim()
            ? ''
            : previousState.selectedCategory,
      }));
      setFormErrorMessage('');
    },
    [],
  );

  const handleCategorySelection = useCallback((category: string) => {
    setFormState((previousState) => ({
      ...previousState,
      selectedCategory: category,
      customCategoryName: '',
    }));
  }, []);

  const handleImageFileSelection = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Revoke old URL before creating new one
      if (temporaryImagePreviewUrl) {
        URL.revokeObjectURL(temporaryImagePreviewUrl);
      }

      setFormState((previousState) => ({
        ...previousState,
        selectedImageFile: file,
      }));
      const localUrl = URL.createObjectURL(file);
      setTemporaryImagePreviewUrl(localUrl);
    },
    [temporaryImagePreviewUrl],
  );

  const handleProductSubmission = async () => {
    if (isSubmittingData) return;
    const finalizedCategory =
      formState.customCategoryName.trim() || formState.selectedCategory.trim();

    setIsSubmittingData(true);
    try {
      const { transformCurrencyStringToNumber, formatNumberToCurrency } =
        await import('../utils/price');
      const numericPrice = transformCurrencyStringToNumber(
        formState.productPrice,
      );
      const standardizedPriceLabel = formatNumberToCurrency(numericPrice);

      if (!settings?.id) throw new Error('Mağaza ID bulunamadı');

      await onProductAddition(
        {
          name: formState.productName.trim(),
          category: finalizedCategory,
          price: standardizedPriceLabel,
          description: formState.productDescription.trim(),
          image_url: null,
          out_of_stock: !formState.isProductInStock,
          is_archived: false,
          store_id: settings.id,
        },
        formState.selectedImageFile || undefined,
      );
      handleCloseAndReset();
    } catch {
      setFormErrorMessage(LABELS.saveError);
    } finally {
      setIsSubmittingData(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const isStepValid = () => {
    if (currentStep === 2) return !!formState.productName.trim();
    if (currentStep === 4)
      return !!(
        formState.selectedCategory.trim() || formState.customCategoryName.trim()
      );
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
      <div className="space-y-8 flex flex-col">
        {/* STEP 1: PHOTO */}
        {currentStep === 1 && (
          <div className={theme.wizard.stepContent}>
            <div className="text-center space-y-2 mb-6">
              <h3 className="font-bold text-stone-800">Ürün Fotoğrafı</h3>
            </div>
            <ProductImagePicker
              imagePreviewUrl={temporaryImagePreviewUrl}
              onFileSelectionChange={handleImageFileSelection}
            />
            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button
                onClick={handleCloseAndReset}
                variant="ghost"
                className="w-full"
                mode="rectangle"
              >
                İPTAL
              </Button>
              <Button
                onClick={nextStep}
                variant="secondary"
                className="w-full"
                mode="rectangle"
              >
                {temporaryImagePreviewUrl ? 'İLERLE' : 'FOTOĞRAFSIZ DEVAM ET'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: NAME */}
        {currentStep === 2 && (
          <div className={theme.wizard.stepContent}>
            <FormInput
              id="product-name-input"
              labelText={LABELS.form.productName}
              name="productName"
              value={formState.productName}
              onChange={handleFormInputChange}
              placeholder={LABELS.form.productNamePlaceholder}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="w-full"
                mode="rectangle"
                icon={<ArrowLeft size={16} />}
              >
                GERİ
              </Button>
              <Button
                onClick={nextStep}
                disabled={!formState.productName.trim()}
                variant="primary"
                className="w-full"
                mode="rectangle"
              >
                SONRAKİ
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: DESCRIPTION */}
        {currentStep === 3 && (
          <div className={theme.wizard.stepContent}>
            <div>
              <label className={theme.typography.label}>
                {LABELS.form.description}
              </label>
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
              <Button
                onClick={prevStep}
                variant="ghost"
                className="w-full"
                mode="rectangle"
                icon={<ArrowLeft size={16} />}
              >
                GERİ
              </Button>
              <Button
                onClick={nextStep}
                variant="primary"
                className="w-full"
                mode="rectangle"
              >
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
            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="w-full"
                mode="rectangle"
                icon={<ArrowLeft size={16} />}
              >
                GERİ
              </Button>
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                variant="primary"
                className="w-full"
                mode="rectangle"
              >
                SONRAKİ
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: PRICE */}
        {currentStep === 5 && (
          <div className={theme.wizard.stepContent}>
            <FormInput
              id="product-price-input"
              labelText={LABELS.form.price}
              name="productPrice"
              value={formState.productPrice}
              onChange={handleFormInputChange}
              placeholder={LABELS.form.pricePlaceholder}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="w-full"
                mode="rectangle"
                icon={<ArrowLeft size={16} />}
              >
                GERİ
              </Button>
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                variant="primary"
                className="w-full"
                mode="rectangle"
              >
                SONRAKİ
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: STOCK */}
        {currentStep === 6 && (
          <div className={theme.wizard.stepContent}>
            <div className="space-y-4">
              <StatusToggle
                label="Stokta Var mı?"
                value={formState.isProductInStock}
                onChange={(val) =>
                  setFormState((p) => ({ ...p, isProductInStock: val }))
                }
                disabled={isSubmittingData}
              />
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight text-center px-4">
                Ürün şu anda satışa hazır ve müşteriler tarafından sipariş
                edilebilir durumda mı?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button
                onClick={prevStep}
                variant="ghost"
                className="w-full"
                mode="rectangle"
                icon={<ArrowLeft size={16} />}
              >
                GERİ
              </Button>
              <Button
                onClick={nextStep}
                variant="primary"
                className="w-full"
                mode="rectangle"
              >
                ÖNİZLEME
              </Button>
            </div>
          </div>
        )}

        {/* STEP 7: PREVIEW & CONFIRM */}
        {currentStep === 7 && (
          <div className={theme.wizard.stepContent}>
            <div className="text-center space-y-1 mb-6">
              <h3 className="font-bold text-stone-800">Son Kontrol</h3>
              <p className="text-xs text-stone-500">
                Ürününüz dükkanda böyle görünecek.
              </p>
            </div>

            {/* REAL UI PREVIEW CARD - 100% VISUAL CONSISTENCY */}
            <div className="flex justify-center py-2">
              <div className="w-full max-w-[200px]">
                <ProductCardUI
                  product={{
                    id: 'preview',
                    name: formState.productName || 'İsimsiz Ürün',
                    description: formState.productDescription || 'Açıklama yok',
                    price: formState.productPrice || '0',
                    category:
                      formState.customCategoryName ||
                      formState.selectedCategory ||
                      'Kategorisiz',
                    image_url: temporaryImagePreviewUrl || '',
                    out_of_stock: !formState.isProductInStock,
                    is_archived: false,
                    sort_order: 0,
                    store_id: settings?.id || '',
                    polished_image_url: null,
                    original_image_url: null,
                    is_polished_pending: false,
                    polished_ready_dismissed: false,
                    text_polished_dismissed: false,
                    suggested_name: null,
                    suggested_description: null,
                  }}
                  className="shadow-2xl shadow-stone-200/50"
                  labelOverride="ÖNİZLEME"
                />
              </div>
            </div>

            {formErrorMessage && (
              <div className={theme.typography.errorBadge}>
                {formErrorMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button
                onClick={prevStep}
                disabled={isSubmittingData}
                variant="ghost"
                className="w-full"
                mode="rectangle"
                icon={<ArrowLeft size={16} />}
              >
                GERİ
              </Button>
              <Button
                onClick={handleProductSubmission}
                disabled={isSubmittingData}
                variant="primary"
                className="w-full"
                mode="rectangle"
                icon={
                  isSubmittingData ? (
                    <div
                      className={THEME.loading.spinner + ' w-3.5 h-3.5'}
                    ></div>
                  ) : null
                }
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
