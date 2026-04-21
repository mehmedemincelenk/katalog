import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../data/config';
import { Product } from '../types';
import Button from './Button';
import BaseModal from './BaseModal';
import { ArrowLeft, TrendingUp, TrendingDown, Percent, Banknote, Sparkles, LayoutDashboard, Terminal } from 'lucide-react';
import { transformCurrencyStringToNumber } from '../utils/price';

type ActionType = 'PRICE' | 'DELETE' | 'ARCHIVE' | 'STOCK' | null;

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  categories: string[];
  onGranularUpdate: (actions: { productId: string; newPrice?: number; delete?: boolean; inStock?: boolean; is_archived?: boolean }[]) => Promise<void>;
}

export default function BulkPriceUpdateModal({ isOpen, onClose, allProducts, categories, onGranularUpdate }: BulkPriceUpdateModalProps) {
  // Step 0: Intro, Step 1: Base Config, Step 1.1: Direction, Step 1.2: Method, Step 1.3: Value, Step 3: Action Desk
  const [currentStep, setCurrentStep] = useState<number>(0); 
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean | null>(null);
  const [isIncrease, setIsIncrease] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Desk State
  const [deskItems, setDeskItems] = useState<Record<string, { included: boolean, manualPrice?: number, manualInStock?: boolean, manualArchived?: boolean }>>({});

  const modalTheme = THEME.addProductModal;

  useEffect(() => {
    if (isOpen) {
        const skipIntro = localStorage.getItem('ekatalog_skip_bulk_intro');
        if (skipIntro === 'true') setCurrentStep(1);
        else setCurrentStep(0);
    }
  }, [isOpen]);

  const resetAll = () => {
    setCurrentStep(0);
    setActionType(null);
    setSelectedCategories([]);
    setIsPercentage(null);
    setIsIncrease(null);
    setInputValue('');
    setDeskItems({});
    setIsProcessing(false);
  };

  const skipIntroPermanently = () => {
    localStorage.setItem('ekatalog_skip_bulk_intro', 'true');
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep === 1) {
       if (actionType === 'PRICE') {
           setCurrentStep(1.1); // Start Price Wizard
           return;
       } else {
           prepareDeskAndDirectTo(3); // Go to desk for non-price actions
           return;
       }
    }
    
    if (currentStep === 1.1) { setCurrentStep(1.2); return; }
    if (currentStep === 1.2) { setCurrentStep(1.3); return; }
    if (currentStep === 1.3) { prepareDeskAndDirectTo(3); return; }

    setCurrentStep(prev => prev + 1);
  };

  const prepareDeskAndDirectTo = (targetStep: number) => {
    const productsForDesk = allProducts.filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category));
    const initialDesk: typeof deskItems = {};
    const isStatusAction = actionType === 'STOCK' || actionType === 'ARCHIVE';
    
    productsForDesk.forEach(p => {
      initialDesk[p.id] = { 
        included: !isStatusAction,
        manualInStock: p.inStock,
        manualArchived: p.is_archived
      };
    });
    setDeskItems(initialDesk);
    setCurrentStep(targetStep);
  };
  
  const prevStep = () => {
    if (currentStep === 1.1) { setCurrentStep(1); return; }
    if (currentStep === 1.2) { setCurrentStep(1.1); return; }
    if (currentStep === 1.3) { setCurrentStep(1.2); return; }
    if (currentStep === 3 && actionType === 'PRICE') { setCurrentStep(1.3); return; }
    if (currentStep === 3) { setCurrentStep(1); return; }
    setCurrentStep(prev => prev - 1);
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
      [id]: { ...prev[id], manualInStock: val, included: true }
    }));
  };

  const updateManualArchived = (id: string, val: boolean) => {
    setDeskItems(prev => ({
      ...prev,
      [id]: { ...prev[id], manualArchived: val, included: true }
    }));
  };

  const applyBulkStatus = (val: boolean) => {
    const newDesk = { ...deskItems };
    initialProductsForDesk.forEach(p => {
      if (actionType === 'STOCK') {
        newDesk[p.id] = { ...newDesk[p.id], manualInStock: val, included: true };
      } else if (actionType === 'ARCHIVE') {
        newDesk[p.id] = { ...newDesk[p.id], manualArchived: val, included: true };
      }
    });
    setDeskItems(newDesk);
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
          const action: any = { productId: id };
          
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
    <BaseModal
      isOpen={isOpen}
      onClose={() => { onClose(); resetAll(); }}
      maxWidth={currentStep === 3 ? "max-w-xl" : "max-w-md"}
      title={currentStep === 0 ? undefined : "Toplu İşlem Merkezi"}
      progress={currentStep > 0 ? { current: Math.floor(currentStep), total: 3 } : undefined}
      disableClickOutside={isProcessing}
      hideCloseButton={isProcessing}
    >
      <div className="space-y-6">
          
          {/* STEP 0: INTRO ONBOARDING */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center text-center space-y-6 py-4 fade-in">
                <div className="w-20 h-20 bg-stone-900 rounded-[32px] flex items-center justify-center text-white shadow-2xl rotate-3">
                    <LayoutDashboard size={40} />
                </div>
                
                <div className="space-y-2">
                    <h4 className="text-base font-black text-stone-900 uppercase tracking-widest">DÜKKAN EKONOMİSİNİ YÖNETİN</h4>
                    <p className="text-[11px] text-stone-400 font-bold leading-relaxed px-6">
                        Bu sihirbaz, yüzlerce ürünün fiyatını, stok durumunu veya görünürlüğünü tek tıkla güncellemenizi sağlar.
                        <br/><br/>
                        <span className="text-stone-900 italic">"Zaman kazanın, dükkanınızı saniyeler içinde yeni sezona hazırlayın."</span>
                    </p>
                </div>

                <div className="w-full bg-stone-50 p-4 rounded-3xl border border-stone-100 flex items-start gap-4 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                        <Sparkles size={18} className="text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-stone-900 tracking-tighter">Diamond Gücü</span>
                        <p className="text-[10px] font-bold text-stone-400 leading-tight mt-1">Önce ayarları yapın, ardından "Action Desk" üzerinden son kontrolü mühürleyin.</p>
                    </div>
                </div>

                <div className="w-full space-y-2 pt-2">
                    <Button onClick={() => setCurrentStep(1)} variant="primary" size="md" mode="rectangle" className="w-full !rounded-[24px] !py-4 font-black">
                        SİHİRBAZI BAŞLAT
                    </Button>
                    <button 
                       onClick={skipIntroPermanently}
                       className="text-[10px] font-black text-stone-300 hover:text-stone-900 uppercase tracking-[0.15em] transition-colors"
                    >
                        BUNU TEKRAR GÖSTERME
                    </button>
                </div>
            </div>
          )}

          {/* STEP 1: BASE ACTION & CATEGORY */}
          {currentStep === 1 && (
             <div className="space-y-6 fade-in">
                <div className="px-1 border-l-4 border-stone-900 pl-4 py-1 mb-6">
                    <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">EYLEM SEÇİMİ</h5>
                    <p className="text-[11px] text-stone-400 font-medium italic mt-1 leading-none">Hangi işlemi yapmak istiyorsunuz?</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'PRICE', label: 'FİYAT AYARI', icon: '💰', color: 'bg-stone-900' },
                        { id: 'STOCK', label: 'STOK DURUMU', icon: '📦', color: 'bg-blue-600' },
                        { id: 'ARCHIVE', label: 'YAYIN DURUMU', icon: '👁️', color: 'bg-amber-600' },
                        { id: 'DELETE', label: 'ÜRÜNLERİ SİL', icon: '🗑️', color: 'bg-red-600' }
                    ].map(opt => (
                        <button 
                            key={opt.id}
                            onClick={() => setActionType(opt.id as any)}
                            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${actionType === opt.id ? `${opt.color} text-white border-transparent shadow-xl scale-105` : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-stone-200'}`}
                        >
                            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{opt.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                        </button>
                    ))}
                </div>

                <div className="pt-6 border-t border-stone-100">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest text-center mb-4">REYON SEÇİN</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                        <button 
                            onClick={() => toggleCategory('TÜMÜ')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${selectedCategories.length === categories.length ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-300 border-stone-100'}`}
                        >
                            TÜMÜ
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${selectedCategories.includes(cat) ? 'bg-stone-200 text-stone-900 border-stone-300' : 'bg-white text-stone-300 border-stone-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <Button 
                    onClick={nextStep} 
                    disabled={!actionType || (selectedCategories.length === 0 && actionType !== 'DELETE')} 
                    variant="primary" 
                    className="w-full !py-4 font-black" 
                    mode="rectangle"
                >
                    DEVAM ET
                </Button>
             </div>
          )}

          {/* PRICE WIZARD: STEP 1.1 - DIRECTION */}
          {currentStep === 1.1 && (
              <div className="space-y-8 flex flex-col items-center fade-in">
                  <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 mx-auto">
                        <TrendingUp size={28} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-stone-900 uppercase tracking-widest mb-1">NEREYE DOĞRU?</h4>
                        <p className="text-[11px] text-stone-400 font-bold italic">Fiyatlarımızı artırıyor muyuz yoksa düşürüyor muyuz?</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 w-full gap-3">
                      <button 
                          onClick={() => { setIsIncrease(true); nextStep(); }}
                          className="flex items-center justify-between p-6 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all"
                      >
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-white/20 rounded-xl"><TrendingUp size={24} /></div>
                              <span className="font-black tracking-widest text-lg">ZAM YAP (📈)</span>
                          </div>
                      </button>
                      <button 
                           onClick={() => { setIsIncrease(false); nextStep(); }}
                           className="flex items-center justify-between p-6 rounded-3xl bg-red-500 text-white shadow-xl shadow-red-100 hover:scale-[1.02] transition-all"
                      >
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-white/20 rounded-xl"><TrendingDown size={24} /></div>
                              <span className="font-black tracking-widest text-lg">İNDİRİM YAP (📉)</span>
                          </div>
                      </button>
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={prevStep} icon={<ArrowLeft size={16}/>} className="text-stone-400 hover:text-stone-900">GERİ DÖN</Button>
              </div>
          )}

          {/* PRICE WIZARD: STEP 1.2 - METHOD */}
          {currentStep === 1.2 && (
              <div className="space-y-8 flex flex-col items-center fade-in">
                   <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 mx-auto">
                        <Banknote size={28} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-stone-900 uppercase tracking-widest mb-1">HESAPLAMA METODU</h4>
                        <p className="text-[11px] text-stone-400 font-bold italic">Değişim sabit mi olsun yoksa yüzdelik mi?</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 w-full gap-3">
                      <button 
                          onClick={() => { setIsPercentage(false); nextStep(); }}
                          className="flex items-center justify-between p-6 rounded-3xl bg-stone-900 text-white shadow-xl hover:scale-[1.02] transition-all"
                      >
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-white/10 rounded-xl"><Banknote size={24} /></div>
                              <div className="flex flex-col text-left">
                                <span className="font-black tracking-widest">SABİT TUTAR</span>
                                <span className="text-[10px] opacity-60">Örn: Tüm fiyatlara 50₺ ekle</span>
                              </div>
                          </div>
                          <span className="text-2xl font-black">₺</span>
                      </button>
                      <button 
                           onClick={() => { setIsPercentage(true); nextStep(); }}
                           className="flex items-center justify-between p-6 rounded-3xl bg-stone-900 text-white shadow-xl hover:scale-[1.02] transition-all"
                      >
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-white/10 rounded-xl"><Percent size={24} /></div>
                              <div className="flex flex-col text-left">
                                <span className="font-black tracking-widest">YÜZDE (%)</span>
                                <span className="text-[10px] opacity-60">Örn: Tüm fiyatlara %10 zam yap</span>
                              </div>
                          </div>
                          <span className="text-2xl font-black">%</span>
                      </button>
                  </div>

                  <Button variant="ghost" size="sm" onClick={prevStep} icon={<ArrowLeft size={16}/>} className="text-stone-400 hover:text-stone-900">GERİ DÖN</Button>
              </div>
          )}

          {/* PRICE WIZARD: STEP 1.3 - VALUE */}
          {currentStep === 1.3 && (
              <div className="space-y-8 flex flex-col items-center fade-in">
                  <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-100 mx-auto">
                        <Terminal size={28} className="text-stone-900" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-stone-900 uppercase tracking-widest mb-1">MİKTARI BELİRLEYİN</h4>
                        <p className="text-[11px] text-stone-400 font-bold italic">{isIncrease ? 'Zam' : 'İndirim'} yapılacak tutarı girin.</p>
                      </div>
                  </div>

                  <div className="relative w-full">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="0"
                        className={`${modalTheme.inputField} !text-center !text-[64px] !font-black !py-10 !pr-16 shadow-2xl rounded-[40px]`}
                        autoFocus
                    />
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-4xl font-black text-stone-200">
                        {isPercentage ? '%' : '₺'}
                    </span>
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <Button onClick={nextStep} disabled={!inputValue} variant="primary" className="w-full !py-5 font-black">MANIFESTOYA GEÇ</Button>
                    <Button variant="ghost" size="sm" onClick={prevStep} icon={<ArrowLeft size={16}/>} className="text-stone-400 hover:text-stone-900">GERİ DÖN</Button>
                  </div>
              </div>
          )}

          {/* FINAL STEP: ACTION DESK / MANIFESTO */}
          {currentStep === 3 && (
             <div className="space-y-4 fade-in flex flex-col h-full">
                <div className="text-center space-y-1 mb-2">
                    <h3 className="font-black text-stone-900 text-[10px] uppercase tracking-widest leading-none">ONAY MANİFESTOSU (ACTION DESK)</h3>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter text-center">İnceleyin ve mühürleyin. Geri dönüşü yoktur.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 min-h-[350px] border border-stone-100 rounded-[32px] bg-stone-50/50 p-2 custom-scrollbar">
                    {/* GLOBAL STATUS TOGGLES */}
                    {(actionType === 'STOCK' || actionType === 'ARCHIVE') && initialProductsForDesk.length > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl border border-stone-300 bg-white shadow-xl mb-4 sticky top-0 z-20">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-stone-900 uppercase tracking-tight">TÜMÜNÜ DEĞİŞTİR</p>
                            </div>
                            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                                <button onClick={() => applyBulkStatus(actionType === 'STOCK' ? true : false)} className="px-4 py-2 bg-white text-[9px] font-black rounded-lg shadow-sm">
                                    {actionType === 'STOCK' ? '✅ STOKTA' : '👁️ GÖRÜNÜR'}
                                </button>
                                <button onClick={() => applyBulkStatus(actionType === 'STOCK' ? false : true)} className="px-4 py-2 bg-stone-900 text-white text-[9px] font-black rounded-lg shadow-lg">
                                    {actionType === 'STOCK' ? '❌ YOK' : '📦 GİZLİ'}
                                </button>
                            </div>
                        </div>
                    )}

                    {initialProductsForDesk.map((p, index) => {
                        const state = deskItems[p.id] || { included: true };
                        const numericPrice = transformCurrencyStringToNumber(p.price);
                        const newPriceValue = calculateNewPrice(numericPrice, state.manualPrice);

                        return (
                            <div key={p.id} className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl border transition-all ${state.included ? 'bg-white border-stone-100 shadow-sm' : 'bg-transparent border-transparent opacity-25 shadow-none'}`}>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-stone-900 truncate uppercase tracking-tighter leading-none">{p.name}</p>
                                    <p className="text-[8px] font-bold text-stone-300 uppercase mt-0.5">{p.category}</p>
                                </div>

                                {actionType === 'PRICE' && state.included && (
                                    <div className="flex flex-col items-end gap-0.5 px-2">
                                        <span className="text-[7px] font-black text-stone-300 line-through leading-none">{p.price}</span>
                                        <span className="text-[10px] font-black text-stone-900 leading-none">{newPriceValue.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => toggleProductInclusion(p.id)}
                                        className={`px-2 py-1 rounded-lg text-[8px] font-black transition-all ${state.included ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-900 border border-stone-100'}`}
                                    >
                                        {state.included ? 'YAP' : 'KALSIN'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">HEDEF:</span>
                        <span className="text-[13px] font-black text-stone-900">{Object.values(deskItems).filter(d => d.included).length} ÜRÜN</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={prevStep} variant="ghost" mode="rectangle" className="h-14 font-black" icon={<ArrowLeft size={16}/>}>GERİ DÖN</Button>
                        <Button 
                            onClick={handleApply} 
                            disabled={isProcessing || Object.values(deskItems).filter(d => d.included).length === 0} 
                            variant={actionType === 'DELETE' ? 'danger' : 'primary'} 
                            className="h-14 font-black !rounded-2xl shadow-xl" 
                            mode="rectangle"
                            loading={isProcessing}
                        >
                            {actionType === 'DELETE' ? 'TOPLU SİL' : 'MÜHÜRLE VE UYGULA'}
                        </Button>
                    </div>
                </div>
             </div>
          )}
      </div>
    </BaseModal>
  );
}
