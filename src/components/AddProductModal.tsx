import React, { useState, memo, useCallback } from 'react';
import { LABELS, THEME } from '../data/config';
import { Product } from '../types';
import Button from './Button';

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
      <label className={theme.button}>
        {LABELS.form.selectImage}
        <input type="file" accept="image/*" className="hidden" onChange={onFileSelectionChange} />
      </label>
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
            <button 
              key={category} 
              type="button" 
              onClick={() => onCategorySelect(category)} 
              className={currentSelection === category && !customCategory ? theme.categoryChipActive : theme.categoryChipInactive}
            >
              {category}
            </button>
          ))}
          {categories.length > 4 && !isExpanded && (
            <button 
              type="button" 
              onClick={() => setIsExpanded(true)} 
              className={theme.categoryShowMore}
            >
              +{categories.length - 4} Daha
            </button>
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

  const handleProductSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmittingData) return;

    const finalizedCategory = formState.customCategoryName.trim() || formState.selectedCategory.trim();
    
    if (!formState.productName.trim() || !finalizedCategory || !formState.productPrice.trim()) {
      setFormErrorMessage(LABELS.form.requiredFieldsError);
      return;
    }

    setIsSubmittingData(true);
    try {
      await onProductAddition({
        name: formState.productName.trim(),
        category: finalizedCategory,
        price: formState.productPrice.trim(),
        description: formState.productDescription.trim(),
        image: null,
        inStock: formState.isProductInStock,
      }, formState.selectedImageFile || undefined);
      handleCloseAndReset();
    } catch (error) {
      setFormErrorMessage("Ürün eklenirken bir hata oluştu.");
    } finally {
      setIsSubmittingData(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className={theme.overlay} role="dialog">
      <div className={theme.container} onClick={event => event.stopPropagation()}>
        
        <div className={theme.header}>
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest">{LABELS.newProductBtn}</h2>
          <Button 
            onClick={handleCloseAndReset} 
            disabled={isSubmittingData} 
            icon={THEME.icons.close}
            variant="ghost"
            size="sm"
            className={theme.headerButton}
          />
        </div>

        <form onSubmit={handleProductSubmission} className={theme.body}>
          <ProductImagePicker imagePreviewUrl={temporaryImagePreviewUrl} onFileSelectionChange={handleImageFileSelection} />

          <div className={theme.formGap}>
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

            <FormInput 
              labelText={LABELS.form.productName} 
              name="productName" 
              value={formState.productName} 
              onChange={handleFormInputChange} 
              placeholder={LABELS.form.productNamePlaceholder} 
              required 
              disabled={isSubmittingData} 
            />
            
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
              required 
              disabled={isSubmittingData} 
            />
            
            <div>
              <label className={theme.typography.label}>{LABELS.form.description}</label>
              <textarea 
                name="productDescription" 
                value={formState.productDescription} 
                onChange={handleFormInputChange} 
                rows={3} 
                disabled={isSubmittingData} 
                className={`${theme.inputField} resize-none overflow-hidden block`} 
                placeholder={LABELS.form.descriptionPlaceholder} 
              />
            </div>
          </div>

          {formErrorMessage && (
            <div className={theme.typography.errorBadge}>
              {formErrorMessage}
            </div>
          )}

          <div className={theme.footer}>
            <Button 
              onClick={handleCloseAndReset} 
              disabled={isSubmittingData}
              mode="rectangle"
              variant="secondary"
              className={theme.footerCancel}
            >
              {LABELS.form.cancelBtn}
            </Button>
            
            <Button 
              type="submit"
              disabled={isSubmittingData}
              mode="rectangle"
              variant="primary"
              className={theme.footerSubmit}
              icon={isSubmittingData ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
            >
              {isSubmittingData ? 'EKLENİYOR...' : LABELS.form.submitBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
