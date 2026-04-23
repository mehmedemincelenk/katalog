import { useState, useMemo, useEffect, memo } from 'react';
import { THEME } from '../data/config';
import Button from './Button';
import BaseModal from './BaseModal';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Percent,
  Banknote,
  Sparkles,
  LayoutDashboard,
  Terminal,
} from 'lucide-react';
import { transformCurrencyStringToNumber } from '../utils/price';
import { BulkPriceUpdateModalProps, Product } from '../types';

type ActionType = 'PRICE' | 'DELETE' | 'ARCHIVE' | 'STOCK' | null;

interface DeskItemState {
  included: boolean;
  manualPrice?: number;
  manualInStock?: boolean;
  manualArchived?: boolean;
}

/**
 * DESK ITEM ROW (Local Diamond Utility)
 * Optimized with memo to prevent redundant re-renders during bulk toggles.
 */
const DeskItemRow = memo(
  ({
    product,
    state,
    actionType,
    newPriceValue,
    onToggle,
  }: {
    product: Product;
    state: DeskItemState;
    actionType: ActionType;
    newPriceValue: number;
    onToggle: (id: string) => void;
  }) => {
    return (
      <div
        className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl border transition-all ${state.included ? 'bg-white border-stone-100 shadow-sm' : 'bg-transparent border-transparent opacity-25 shadow-none'}`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-stone-900 truncate uppercase tracking-tighter leading-none">
            {product.name}
          </p>
          <p className="text-[8px] font-bold text-stone-300 uppercase mt-0.5">
            {product.category}
          </p>
        </div>

        {actionType === 'PRICE' && state.included && (
          <div className="flex flex-col items-end gap-0.5 px-2">
            <span className="text-[7px] font-black text-stone-300 line-through leading-none">
              {product.price}
            </span>
            <span className="text-[10px] font-black text-stone-900 leading-none">
              {newPriceValue.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            onClick={() => onToggle(product.id)}
            variant={state.included ? 'primary' : 'secondary'}
            mode="rectangle"
            size="sm"
            className={`!px-2 !py-1 !rounded-lg !text-[8px] font-black transition-all shadow-none ${state.included ? '!bg-stone-900 !text-white shadow-md' : '!text-stone-400 hover:!text-stone-900 border border-stone-100 bg-white'}`}
          >
            {state.included ? 'YAP' : 'KALSIN'}
          </Button>
        </div>
      </div>
    );
  },
);

/**
 * BULK PRICE UPDATE MODAL (Diamond Standard)
 * -----------------------------------------------------------
 * A high-powered wizard for mass-managing catalog economics.
 */
export default function BulkPriceUpdateModal({
  isOpen,
  onClose,
  allProducts,
  categories,
  onGranularUpdate,
}: BulkPriceUpdateModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean | null>(null);
  const [isIncrease, setIsIncrease] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deskItems, setDeskItems] = useState<Record<string, DeskItemState>>({});

  const modalTheme = THEME.addProductModal;

  // Diamond Sync: Standardized way to handle modal initialization
  useEffect(() => {
    if (isOpen) {
      const skipIntro =
        localStorage.getItem('ekatalog_skip_bulk_intro') === 'true';
      setCurrentStep(skipIntro ? 1 : 0);
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
        setCurrentStep(1.1);
        return;
      }
      prepareDeskAndDirectTo(3);
      return;
    }

    if (currentStep === 1.1) {
      setCurrentStep(1.2);
      return;
    }
    if (currentStep === 1.2) {
      setCurrentStep(1.3);
      return;
    }
    if (currentStep === 1.3) {
      prepareDeskAndDirectTo(3);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prepareDeskAndDirectTo = (targetStep: number) => {
    const productsForDesk = allProducts.filter(
      (p) =>
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category),
    );
    const initialDesk: Record<string, DeskItemState> = {};
    const isStatusAction = actionType === 'STOCK' || actionType === 'ARCHIVE';

    productsForDesk.forEach((p) => {
      initialDesk[p.id] = {
        included: !isStatusAction,
        manualInStock: !p.out_of_stock,
        manualArchived: p.is_archived,
      };
    });
    setDeskItems(initialDesk);
    setCurrentStep(targetStep);
  };

  const prevStep = () => {
    if (currentStep === 1.1) {
      setCurrentStep(1);
      return;
    }
    if (currentStep === 1.2) {
      setCurrentStep(1.1);
      return;
    }
    if (currentStep === 1.3) {
      setCurrentStep(1.2);
      return;
    }
    if (currentStep === 3 && actionType === 'PRICE') {
      setCurrentStep(1.3);
      return;
    }
    if (currentStep === 3) {
      setCurrentStep(1);
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'TÜMÜ') {
      setSelectedCategories(
        selectedCategories.length === categories.length ? [] : [...categories],
      );
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const initialProductsForDesk = useMemo(() => {
    return allProducts
      .filter(
        (p) =>
          selectedCategories.length === 0 ||
          selectedCategories.includes(p.category),
      )
      .sort((a, b) => {
        const catA = categories.indexOf(a.category);
        const catB = categories.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  }, [allProducts, selectedCategories, categories]);

  const toggleProductInclusion = (id: string) => {
    setDeskItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], included: !prev[id]?.included },
    }));
  };

  const applyBulkStatus = (val: boolean) => {
    const newDesk = { ...deskItems };
    initialProductsForDesk.forEach((p) => {
      if (actionType === 'STOCK') {
        newDesk[p.id] = {
          ...newDesk[p.id],
          manualInStock: val,
          included: true,
        };
      } else if (actionType === 'ARCHIVE') {
        newDesk[p.id] = {
          ...newDesk[p.id],
          manualArchived: val,
          included: true,
        };
      }
    });
    setDeskItems(newDesk);
  };

  const calculateNewPrice = (current: number) => {
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
          const product = allProducts.find((p) => p.id === id)!;
          const action: {
            productId: string;
            newPrice?: number;
            category?: string;
            delete?: boolean;
            out_of_stock?: boolean;
            is_archived?: boolean;
          } = { productId: id };

          if (actionType === 'PRICE') {
            const currentP = transformCurrencyStringToNumber(product.price);
            action.newPrice = calculateNewPrice(currentP);
          } else if (actionType === 'DELETE') {
            action.delete = true;
          } else if (actionType === 'STOCK') {
            action.out_of_stock = !state.manualInStock;
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
      onClose={() => {
        onClose();
        resetAll();
      }}
      maxWidth={currentStep === 3 ? 'max-w-xl' : 'max-w-md'}
      title={currentStep === 0 ? undefined : 'Toplu İşlem Merkezi'}
      progress={
        currentStep > 0
          ? { current: Math.floor(currentStep), total: 3 }
          : undefined
      }
      disableClickOutside={isProcessing}
      hideCloseButton={isProcessing}
    >
      <div className="space-y-6">
        {/* STEP 0: INTRO */}
        {currentStep === 0 && (
          <div className="flex flex-col items-center text-center space-y-6 py-4 fade-in">
            <div className="w-20 h-20 bg-stone-900 rounded-[32px] flex items-center justify-center text-white shadow-2xl rotate-3">
              <LayoutDashboard size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-black text-stone-900 uppercase tracking-widest">
                DÜKKAN EKONOMİSİNİ YÖNETİN
              </h4>
              <p className="text-[11px] text-stone-400 font-bold leading-relaxed px-6">
                Bu sihirbaz, yüzlerce ürünün fiyatını, stok durumunu veya
                görünürlüğünü tek tıkla güncellemenizi sağlar.
              </p>
            </div>
            <div className="w-full bg-stone-50 p-4 rounded-3xl border border-stone-100 flex items-start gap-4 text-left">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-stone-900 tracking-tighter">
                  Diamond Gücü
                </span>
                <p className="text-[10px] font-bold text-stone-400 leading-tight mt-1">
                  Önce ayarları yapın, ardından "Action Desk" üzerinden son
                  kontrolü mühürleyin.
                </p>
              </div>
            </div>
            <div className="w-full space-y-2 pt-2">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="primary"
                size="md"
                mode="rectangle"
                className="w-full !rounded-[24px] !py-4 font-black"
              >
                SİHİRBAZI BAŞLAT
              </Button>
              <Button
                onClick={skipIntroPermanently}
                variant="ghost"
                className="w-full !text-[10px] font-black !text-stone-300 hover:!text-stone-900 uppercase tracking-widest shadow-none"
              >
                BUNU TEKRAR GÖSTERME
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: CONFIG */}
        {currentStep === 1 && (
          <div className="space-y-6 fade-in">
            <div className="px-1 border-l-4 border-stone-900 pl-4 py-1 mb-6">
              <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                EYLEM SEÇİMİ
              </h5>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'PRICE',
                  label: 'FİYAT AYARI',
                  icon: '💰',
                  color: 'bg-stone-900',
                },
                {
                  id: 'STOCK',
                  label: 'STOK DURUMU',
                  icon: '📦',
                  color: 'bg-blue-600',
                },
                {
                  id: 'ARCHIVE',
                  label: 'YAYIN DURUMU',
                  icon: '👁️',
                  color: 'bg-amber-600',
                },
                {
                  id: 'DELETE',
                  label: 'ÜRÜNLERİ SİL',
                  icon: '🗑️',
                  color: 'bg-red-600',
                },
              ].map((opt) => (
                <Button
                  key={opt.id}
                  onClick={() => setActionType(opt.id as ActionType)}
                  variant="ghost"
                  className={`!h-auto !p-4 !rounded-3xl border-2 flex !flex-col !items-center !gap-2 group shadow-none ${actionType === opt.id ? `${opt.color} !text-white !border-transparent shadow-xl scale-105` : 'bg-stone-50 border-stone-100 text-stone-400'}`}
                >
                  <span className="text-3xl mb-1">{opt.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {opt.label}
                  </span>
                </Button>
              ))}
            </div>
            <div className="pt-6 border-t border-stone-100">
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest text-center mb-4">
                REYON SEÇİN
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                <Button
                  onClick={() => toggleCategory('TÜMÜ')}
                  variant={
                    selectedCategories.length === categories.length
                      ? 'primary'
                      : 'secondary'
                  }
                  size="sm"
                  className={`!px-4 !py-2 !rounded-xl !text-[10px] font-black ${selectedCategories.length === categories.length ? '!bg-stone-900' : 'bg-white !text-stone-300'}`}
                >
                  TÜMÜ
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    variant="secondary"
                    size="sm"
                    className={`!px-4 !py-2 !rounded-xl !text-[10px] font-black ${selectedCategories.includes(cat) ? '!bg-stone-200 !text-stone-900' : 'bg-white !text-stone-300'}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={nextStep}
              disabled={
                !actionType ||
                (selectedCategories.length === 0 && actionType !== 'DELETE')
              }
              variant="primary"
              className="w-full !py-4 font-black"
            >
              DEVAM ET
            </Button>
          </div>
        )}

        {/* PRICE STEPS 1.1, 1.2, 1.3 */}
        {currentStep === 1.1 && (
          <div className="space-y-8 flex flex-col items-center fade-in">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 mx-auto">
                <TrendingUp size={28} />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 uppercase tracking-widest mb-1">
                  NEREYE DOĞRU?
                </h4>
                <p className="text-[11px] text-stone-400 font-bold italic">
                  Fiyatlarımızı artırıyor muyuz yoksa düşürüyor muyuz?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 w-full gap-3">
              <Button
                onClick={() => {
                  setIsIncrease(true);
                  nextStep();
                }}
                variant="primary"
                className="!h-auto !p-6 !rounded-[2rem] !bg-emerald-500 !text-white shadow-xl !justify-between"
                icon={
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp size={24} />
                  </div>
                }
              >
                <span className="font-black tracking-widest text-lg">
                  ZAM YAP (📈)
                </span>
              </Button>
              <Button
                onClick={() => {
                  setIsIncrease(false);
                  nextStep();
                }}
                variant="primary"
                className="!h-auto !p-6 !rounded-[2rem] !bg-red-500 !text-white shadow-xl !justify-between"
                icon={
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingDown size={24} />
                  </div>
                }
              >
                <span className="font-black tracking-widest text-lg">
                  İNDİRİM YAP (📉)
                </span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              icon={<ArrowLeft size={16} />}
              className="!text-stone-400 shadow-none font-black uppercase text-[10px] tracking-widest"
            >
              GERİ DÖN
            </Button>
          </div>
        )}

        {currentStep === 1.2 && (
          <div className="space-y-8 flex flex-col items-center fade-in">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 mx-auto">
                <Banknote size={28} />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 uppercase tracking-widest mb-1">
                  HESAPLAMA METODU
                </h4>
                <p className="text-[11px] text-stone-400 font-bold italic">
                  Değişim sabit mi olsun yoksa yüzdelik mi?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 w-full gap-3">
              <Button
                onClick={() => {
                  setIsPercentage(false);
                  nextStep();
                }}
                variant="primary"
                className="!h-auto !p-6 !rounded-[2rem] !bg-stone-900 !text-white shadow-xl !justify-between"
                icon={
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Banknote size={24} />
                  </div>
                }
              >
                <div className="flex flex-col text-left">
                  <span className="font-black tracking-widest">
                    SABİT TUTAR
                  </span>
                  <span className="text-[10px] opacity-60">
                    Örn: Tüm fiyatlara 50₺ ekle
                  </span>
                </div>
              </Button>
              <Button
                onClick={() => {
                  setIsPercentage(true);
                  nextStep();
                }}
                variant="primary"
                className="!h-auto !p-6 !rounded-[2rem] !bg-stone-900 !text-white shadow-xl !justify-between"
                icon={
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Percent size={24} />
                  </div>
                }
              >
                <div className="flex flex-col text-left">
                  <span className="font-black tracking-widest">YÜZDE (%)</span>
                  <span className="text-[10px] opacity-60">
                    Örn: Tüm fiyatlara %10 zam yap
                  </span>
                </div>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              icon={<ArrowLeft size={16} />}
              className="!text-stone-400 shadow-none font-black uppercase text-[10px] tracking-widest"
            >
              GERİ DÖN
            </Button>
          </div>
        )}

        {currentStep === 1.3 && (
          <div className="space-y-8 flex flex-col items-center fade-in">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-100 mx-auto">
                <Terminal size={28} className="text-stone-900" />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 uppercase tracking-widest mb-1">
                  MİKTARI BELİRLEYİN
                </h4>
                <p className="text-[11px] text-stone-400 font-bold italic">
                  {isIncrease ? 'Zam' : 'İndirim'} yapılacak tutarı girin.
                </p>
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
              <Button
                onClick={nextStep}
                disabled={!inputValue}
                variant="primary"
                className="w-full !py-5 font-black"
              >
                MANIFESTOYA GEÇ
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                icon={<ArrowLeft size={16} />}
                className="!text-stone-400 shadow-none font-black uppercase text-[10px] tracking-widest"
              >
                GERİ DÖN
              </Button>
            </div>
          </div>
        )}

        {/* FINAL STEP: ACTION DESK */}
        {currentStep === 3 && (
          <div className="space-y-4 fade-in flex flex-col h-full">
            <div className="text-center space-y-1 mb-2">
              <h3 className="font-black text-stone-900 text-[10px] uppercase tracking-widest leading-none">
                ONAY MANİFESTOSU (ACTION DESK)
              </h3>
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter text-center">
                İnceleyin ve mühürleyin. Geri dönüşü yoktur.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-[350px] border border-stone-100 rounded-[32px] bg-stone-50/50 p-2 custom-scrollbar">
              {(actionType === 'STOCK' || actionType === 'ARCHIVE') &&
                initialProductsForDesk.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-stone-300 bg-white shadow-xl mb-4 sticky top-0 z-20">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-stone-900 uppercase tracking-tight">
                        TÜMÜNÜ DEĞİŞTİR
                      </p>
                    </div>
                    <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                      <Button
                        onClick={() =>
                          applyBulkStatus(actionType === 'STOCK' ? true : false)
                        }
                        variant="secondary"
                        size="sm"
                        className="!bg-white !text-stone-900 !text-[9px] font-black !rounded-lg shadow-sm border-none"
                      >
                        {actionType === 'STOCK' ? '✅ STOKTA' : '👁️ GÖRÜNÜR'}
                      </Button>
                      <Button
                        onClick={() =>
                          applyBulkStatus(actionType === 'STOCK' ? false : true)
                        }
                        variant="primary"
                        size="sm"
                        className="!bg-stone-900 !text-white !text-[9px] font-black !rounded-lg shadow-lg"
                      >
                        {actionType === 'STOCK' ? '❌ YOK' : '📦 GİZLİ'}
                      </Button>
                    </div>
                  </div>
                )}
              {initialProductsForDesk.map((p) => (
                <DeskItemRow
                  key={p.id}
                  product={p}
                  state={deskItems[p.id] || { included: true }}
                  actionType={actionType}
                  newPriceValue={calculateNewPrice(
                    transformCurrencyStringToNumber(p.price),
                  )}
                  onToggle={toggleProductInclusion}
                />
              ))}
            </div>
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">
                  HEDEF:
                </span>
                <span className="text-[13px] font-black text-stone-900">
                  {Object.values(deskItems).filter((d) => d.included).length}{' '}
                  ÜRÜN
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={prevStep}
                  variant="ghost"
                  className="h-14 font-black shadow-none text-stone-400"
                  icon={<ArrowLeft size={16} />}
                >
                  GERİ DÖN
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={
                    isProcessing ||
                    Object.values(deskItems).filter((d) => d.included)
                      .length === 0
                  }
                  variant={actionType === 'DELETE' ? 'danger' : 'primary'}
                  className="h-14 font-black !rounded-2xl shadow-xl"
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
