// FILE: src/components/BulkPriceUpdateModal.tsx
// ROLE: Modal interface for performing bulk operations (price adjustments, status changes, deletions) across multiple products
// READS FROM: src/data/config, src/utils/price, src/types
// USED BY: FloatingAdminMenu or other admin controls

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../data/config';
import { Product } from '../types';
import Button from './Button';
import { transformCurrencyStringToNumber } from '../utils/price';

type ActionType = 'PRICE' | 'DELETE' | 'ARCHIVE' | 'STOCK' | null;

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  categories: string[];
  onGranularUpdate: (actions: { productId: string; newPrice?: number; delete?: boolean; inStock?: boolean; is_archived?: boolean }[]) => Promise<void>;
}

// ARCHITECTURE: BulkPriceUpdateModal
// PURPOSE: A multi-step wizard allowing admins to filter products and apply batch operations (e.g., +10% price increase)
// DEPENDENCIES: THEME, framer-motion, transformCurrencyStringToNumber
// CONSUMERS: Renders conditionally via Admin panels
export default function BulkPriceUpdateModal({ isOpen, onClose, allProducts, categories, onGranularUpdate }: BulkPriceUpdateModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean | null>(null);
  const [isIncrease, setIsIncrease] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Desk State: { productId: { included: boolean, manualPrice?: number, manualInStock?: boolean, manualArchived?: boolean } }
  const [deskItems, setDeskItems] = useState<Record<string, { included: boolean, manualPrice?: number, manualInStock?: boolean, manualArchived?: boolean }>>({});

  const modalTheme = THEME.addProductModal;

  const resetAll = () => {
    setCurrentStep(1);
    setActionType(null);
    setSelectedCategories([]);
    setIsPercentage(null);
    setIsIncrease(null);
    setInputValue('');
    setDeskItems({});
    setIsProcessing(false);
  };

  const nextStep = () => {
    // PREPARE INITIAL DESK DATA when entering Step 2 or 3
    if (currentStep === 1) {
      const productsForDesk = allProducts.filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category));
      const initialDesk: typeof deskItems = {};
      productsForDesk.forEach(p => {
        initialDesk[p.id] = { 
          included: true,
          manualInStock: p.inStock,
          manualArchived: p.is_archived
        };
      });
      setDeskItems(initialDesk);

      // If NOT PRICE, skip the "Value" step (Step 2) and go to the Action Desk (Step 3)
      if (actionType !== 'PRICE') {
        setCurrentStep(3);
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    if (currentStep === 3 && actionType !== 'PRICE') {
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'TÜMÜ') {
      setSelectedCategories(selectedCategories.length === categories.length ? [] : [...categories]);
      return;
    }
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const initialProductsForDesk = useMemo(() => {
    return allProducts
      .filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category))
      .sort((a, b) => {
        const catA = categories.indexOf(a.category);
        const catB = categories.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  }, [allProducts, selectedCategories, categories]);

  const toggleProductInclusion = (id: string) => {
    setDeskItems(prev => ({
      ...prev,
      [id]: { ...prev[id], included: !prev[id]?.included }
    }));
  };

  const updateManualPrice = (id: string, val: string) => {
    const num = transformCurrencyStringToNumber(val);
    setDeskItems(prev => ({
      ...prev,
      [id]: { ...prev[id], manualPrice: num }
    }));
  };

  const updateManualInStock = (id: string, val: boolean) => {
    setDeskItems(prev => ({
      ...prev,
      [id]: { ...prev[id], manualInStock: val }
    }));
  };

  const updateManualArchived = (id: string, val: boolean) => {
    setDeskItems(prev => ({
      ...prev,
      [id]: { ...prev[id], manualArchived: val }
    }));
  };

  const calculateNewPrice = (current: number, manual?: number) => {
    if (manual !== undefined) return manual;
    if (!inputValue) return current;
    const amount = transformCurrencyStringToNumber(inputValue);
    let result = current;
    if (isPercentage) {
      const adj = current * (amount / 100);
      result = isIncrease ? current + adj : current - adj;
    } else {
      result = isIncrease ? current + amount : current - amount;
    }
    return result < 0 ? 0 : result;
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const granularActions = Object.entries(deskItems)
        .filter(([, state]) => state.included)
        .map(([id, state]) => {
          const product = allProducts.find(p => p.id === id)!;
          
          type Action = { 
            productId: string; 
            newPrice?: number; 
            delete?: boolean; 
            inStock?: boolean; 
            is_archived?: boolean 
          };

          const action: Action = { productId: id };
          
          if (actionType === 'PRICE') {
            const currentP = transformCurrencyStringToNumber(product.price);
            action.newPrice = calculateNewPrice(currentP, state.manualPrice);
          } else if (actionType === 'DELETE') {
            action.delete = true;
          } else if (actionType === 'STOCK') {
            action.inStock = state.manualInStock;
          } else if (actionType === 'ARCHIVE') {
            action.is_archived = state.manualArchived;
          }
          
          return action;
        });

      await onGranularUpdate(granularActions);
      onClose();
      resetAll();
    } catch (err) {
      console.error('Bulk action failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalTheme.overlay}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`${modalTheme.container} !max-w-md h-[90vh] sm:h-auto overflow-hidden flex flex-col`}
      >
        <div className={modalTheme.header}>
          <div className="flex flex-col text-left">
            <h2 className="text-xl sm:text-[32px] font-black text-stone-900 tracking-tighter sm:mb-1.5">İşlem Paneli</h2>
            <p className="text-[10px] sm:text-[16px] font-bold text-stone-400 uppercase tracking-widest leading-none mt-1">
              {currentStep === 1 ? 'EYLEM SEÇİN' : (currentStep === 2 ? 'MİKTAR GİRİN' : 'ONAY MANİFESTOSU')}
            </p>
          </div>
          <button onClick={() => { onClose(); resetAll(); }} className={modalTheme.headerButton}>
            {THEME.icons.close}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {currentStep === 1 && (
            <div className="space-y-6 fade-in">
              {/* ACTION TYPE SELECTION - GRID */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <button 
                  onClick={() => setActionType('PRICE')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 ${actionType === 'PRICE' ? 'border-stone-900 bg-stone-900 text-white shadow-xl scale-105' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200'}`}
                >
                  <span className="text-2xl sm:text-4xl">💰</span>
                  <span className="text-[9px] sm:text-[14px] font-black uppercase tracking-widest text-center">FİYAT AYARI</span>
                </button>
                <button 
                  onClick={() => setActionType('STOCK')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 ${actionType === 'STOCK' ? 'border-blue-600 bg-blue-600 text-white shadow-xl scale-105' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-blue-200'}`}
                >
                  <span className="text-2xl sm:text-4xl">📦</span>
                  <span className="text-[9px] sm:text-[14px] font-black uppercase tracking-widest text-center">STOKTA VAR/YOK</span>
                </button>
                <button 
                  onClick={() => setActionType('ARCHIVE')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 ${actionType === 'ARCHIVE' ? 'border-amber-600 bg-amber-600 text-white shadow-xl scale-105' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-amber-200'}`}
                >
                  <span className="text-2xl sm:text-4xl">👁️</span>
                  <span className="text-[9px] sm:text-[14px] font-black uppercase tracking-widest text-center">GİZLE/GÖSTER</span>
                </button>
                <button 
                  onClick={() => setActionType('DELETE')}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 ${actionType === 'DELETE' ? 'border-red-600 bg-red-600 text-white shadow-xl scale-105' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-red-100'}`}
                >
                  <span className="text-2xl sm:text-4xl">🗑️</span>
                  <span className="text-[9px] sm:text-[14px] font-black uppercase tracking-widest text-center">TOPLU SİLME</span>
                </button>
              </div>

              {/* CATEGORY SELECTION */}
              <div className="space-y-3 sm:space-y-5 pt-4 sm:pt-6 border-t border-stone-100">
                <p className="text-[10px] sm:text-[16px] font-black text-stone-400 uppercase tracking-[0.2em] text-center mb-4 sm:mb-6">İŞLEM YAPILACAK REYONLAR</p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  <button 
                    onClick={() => toggleCategory('TÜMÜ')}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-[9px] sm:text-[14px] font-black transition-all border-2 ${selectedCategories.length === categories.length ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-100 shadow-sm'}`}
                  >
                    TÜMÜ
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-[9px] sm:text-[14px] font-black transition-all border-2 ${selectedCategories.includes(cat) ? 'bg-stone-50 text-stone-900 border-stone-900' : 'bg-white text-stone-400 border-stone-100 shadow-sm'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={nextStep} 
                  disabled={!actionType || (selectedCategories.length === 0 && actionType !== 'DELETE')} 
                  variant="primary" 
                  className="w-full !py-4 sm:!py-6 sm:text-[19px] shadow-2xl" 
                  mode="rectangle"
                >
                  {!actionType ? 'ÖNCE EYLEMİ SEÇİN' : (selectedCategories.length === 0 ? 'REYON SEÇİN' : 'İŞLEM PANELİNE GEÇ')}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && actionType === 'PRICE' && (
            <div className="space-y-6 sm:space-y-10 fade-in">
              <div className="text-center space-y-1 sm:space-y-1.5">
                <h3 className="font-black text-stone-900 text-[10px] sm:text-[16px] uppercase tracking-widest leading-none">DEĞİŞKENİ BELİRLEYİN</h3>
                <p className="text-[9px] sm:text-[14px] font-bold text-stone-400 tracking-tighter uppercase italic text-center">Miktar girin, zam mı indirim mi karar verin.</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-stone-50 rounded-xl border border-stone-100">
                  <button 
                    onClick={() => setIsPercentage(false)}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${isPercentage === false ? 'bg-white text-stone-900 shadow-sm border border-stone-100' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    SABİT ₺
                  </button>
                  <button 
                    onClick={() => setIsPercentage(true)}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${isPercentage === true ? 'bg-white text-stone-900 shadow-sm border border-stone-100' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    YÜZDE (%)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="0"
                    className={`${modalTheme.inputField} !text-center !text-4xl sm:!text-[58px] !font-black !py-8 sm:!py-12 !pr-10 sm:!pr-16 shadow-inner`}
                    autoFocus
                  />
                  <span className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 text-2xl sm:text-[38px] font-black text-stone-300">
                    {isPercentage === true ? '%' : (isPercentage === false ? '₺' : '')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsIncrease(true)}
                    className={`flex-1 py-4 rounded-xl font-black text-[10px] transition-all border-2 ${isIncrease === true ? 'bg-black text-white border-black shadow-xl scale-[1.02]' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'}`}
                  >
                    ZAM (+)
                  </button>
                  <button
                    onClick={() => setIsIncrease(false)}
                    className={`flex-1 py-4 rounded-xl font-black text-[10px] transition-all border-2 ${isIncrease === false ? 'bg-red-600 text-white border-red-600 shadow-xl scale-[1.02]' : 'bg-white text-stone-400 border-stone-100 hover:border-red-100'}`}
                  >
                    İNDİRİM (-)
                  </button>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-5">
                <button 
                  onClick={prevStep} 
                  className="w-11 h-11 sm:w-[70px] sm:h-[70px] flex items-center justify-center rounded-xl bg-stone-50 border border-stone-100 text-stone-400 hover:text-stone-900 transition-colors sm:px-5"
                >
                  <div className="w-5 h-5 sm:w-8 sm:h-8">{THEME.icons.chevronLeft}</div>
                </button>
                <Button 
                   onClick={nextStep} 
                   disabled={inputValue === '' || isIncrease === null || isPercentage === null}
                   variant="primary" 
                   className="flex-[2] !py-4 sm:!py-6 sm:!text-[19px]" 
                   mode="rectangle"
                >
                  İŞLEM PANELİNE GEÇ
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 fade-in flex flex-col h-full">
              <div className="text-center space-y-1">
                <h3 className="font-black text-stone-900 text-[10px] uppercase tracking-widest leading-none">İŞLEM PANELİ (ACTION DESK)</h3>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter text-center">
                  {actionType === 'PRICE' ? 'Yeni fiyatları mühürleyin.' : 'Ürün verilerini denetleyin.'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 min-h-[300px] border border-stone-100 rounded-3xl bg-stone-50/50 p-1.5 custom-scrollbar">
                {initialProductsForDesk.map((p, index) => {
                  const state = deskItems[p.id] || { included: true };
                  const numericPrice = transformCurrencyStringToNumber(p.price);
                  const newPrice = calculateNewPrice(numericPrice, state.manualPrice);
                  const showHeader = index === 0 || p.category !== initialProductsForDesk[index - 1].category;

                  return (
                    <div key={p.id}>
                      {showHeader && (
                        <div className="flex items-center gap-2 px-3 py-3 mt-4 mb-2 first:mt-2">
                           <div className="h-[1px] flex-1 bg-stone-200"></div>
                           <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em]">{p.category}</span>
                           <div className="h-[1px] flex-1 bg-stone-200"></div>
                        </div>
                      )}
                      <div className={`flex items-center gap-2 p-2 rounded-2xl border transition-all ${state.included ? 'bg-white border-stone-100 shadow-sm' : 'bg-transparent border-transparent opacity-40'}`}>
                        <button 
                          onClick={() => toggleProductInclusion(p.id)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${state.included ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}
                        >
                          {state.included ? '✓' : '×'}
                        </button>

                        <div className="flex-1 min-w-0 flex flex-col text-left">
                          <p className="text-[10px] font-black text-stone-800 truncate leading-none mb-1 uppercase tracking-tight">{p.name}</p>
                        </div>

                        {actionType === 'PRICE' && state.included && (
                          <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1.5 rounded-xl border border-stone-100">
                            <span className="text-[9px] font-bold text-stone-300 line-through tracking-tighter">{p.price}</span>
                            <input 
                              type="number"
                              value={state.manualPrice !== undefined ? String(state.manualPrice) : String(newPrice)}
                              onChange={(e) => updateManualPrice(p.id, e.target.value)}
                              className="w-14 bg-transparent text-[11px] font-black text-stone-900 text-right focus:outline-none"
                            />
                            <span className="text-[9px] font-black text-stone-400">₺</span>
                          </div>
                        )}

                        {actionType === 'STOCK' && state.included && (
                          <button 
                            onClick={() => updateManualInStock(p.id, !state.manualInStock)}
                            className={`px-3 py-1.5 rounded-xl text-[8px] font-black transition-all shadow-sm ${state.manualInStock ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100 font-black'}`}
                          >
                            {state.manualInStock ? 'STOKTA' : 'STOKTA YOK'}
                          </button>
                        )}

                        {actionType === 'ARCHIVE' && state.included && (
                          <button 
                            onClick={() => updateManualArchived(p.id, !state.manualArchived)}
                            className={`px-3 py-1.5 rounded-xl text-[8px] font-black transition-all shadow-sm ${state.manualArchived ? 'bg-stone-100 text-stone-400 border border-stone-200' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}
                          >
                            {state.manualArchived ? 'GİZLİ' : 'GÖRÜNÜR'}
                          </button>
                        )}

                        {actionType === 'DELETE' && state.included && (
                          <span className="text-[9px] font-black text-red-600 uppercase px-2 tracking-tighter italic">SİLİNECEK</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 sm:pt-4">
                <div className="flex justify-between items-center mb-4 sm:mb-6 px-2 sm:px-3">
                  <span className="text-[10px] sm:text-[16px] font-black text-stone-400 uppercase tracking-widest">Seçili:</span>
                  <span className="text-xs sm:text-[19px] font-black text-stone-900">{Object.values(deskItems).filter(d => d.included).length} / {initialProductsForDesk.length} ÜRÜN</span>
                </div>
                <div className="flex gap-3 sm:gap-5 px-1 pb-1">
                  <button 
                    onClick={prevStep} 
                    className="w-12 h-12 sm:w-[76px] sm:h-[76px] flex items-center justify-center rounded-xl sm:rounded-2xl bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors shadow-sm"
                  >
                    <div className="w-5 h-5 sm:w-8 sm:h-8">{THEME.icons.chevronLeft}</div>
                  </button>
                  <Button 
                    onClick={handleApply}
                    disabled={isProcessing || Object.values(deskItems).filter(d => d.included).length === 0}
                    variant={actionType === 'DELETE' ? 'danger' : 'primary'} 
                    className="flex-[2] !py-4 sm:!py-6 sm:!text-[19px] shadow-2xl" 
                    mode="rectangle"
                    loading={isProcessing}
                  >
                    BİTİR VE UYGULA
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
