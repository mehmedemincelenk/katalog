// FILE ROLE: B2B Price List Generator (Export/Print Utility)
// DEPENDS ON: THEME, Product Logic, html2canvas
// CONSUMED BY: FloatingGuestMenu.tsx, Admin Controls
import { useState, useRef, useMemo, useEffect } from 'react';
import { Product } from '../types';
import Button from './Button';
import BaseModal from './BaseModal';
import {
  transformCurrencyStringToNumber,
  formatNumberToCurrency,
} from '../utils/price';
import { TECH } from '../data/config';
import html2canvas from 'html2canvas';
import {
  Download,
  Printer,
  ArrowLeft,
  Layers3,
  CheckSquare,
  Square,
} from 'lucide-react';
import InfoHint from './InfoHint';

import { PriceListModalProps } from '../types';

/**
 * PRICE LIST MODAL (Diamond Standard)
 * -----------------------------------------------------------
 * Specialized tool for generating printable/exportable price catalogs.
 * Standardized to use the atomic Button unit for consistent B2B experience.
 */
export default function PriceListModal({
  isOpen,
  onClose,
  products,
  categories,
  displayCurrency,
  exchangeRates,
  activeDiscount,
  storeName,
}: PriceListModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(1); // Step 0 is Intro
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Group products
  const groupedProducts = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        const category = product.category || TECH.products.fallbackCategory;
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      },
      {} as Record<string, Product[]>,
    );
  }, [products]);

  // Categories that actually have products
  const populatedCategories = useMemo(() => {
    return categories.filter((cat) => (groupedProducts[cat] || []).length > 0);
  }, [categories, groupedProducts]);

  useEffect(() => {
    if (isOpen) {
      const skipIntro = localStorage.getItem('ekatalog_skip_price_list_intro');
      setStep(skipIntro === 'true' ? 1 : 0);
      setSelectedCategories([]);
      setIsExporting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === populatedCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...populatedCategories]);
    }
  };

  const calculateFinalPrice = (product: Product) => {
    const isPromotionActive =
      activeDiscount &&
      (!activeDiscount.category ||
        activeDiscount.category === product.category);
    const baseMathPrice = transformCurrencyStringToNumber(product.price);

    if (isPromotionActive && baseMathPrice > 0) {
      return formatNumberToCurrency(
        baseMathPrice * (1 - activeDiscount.rate),
        displayCurrency,
        exchangeRates,
      );
    }
    return formatNumberToCurrency(
      baseMathPrice,
      displayCurrency,
      exchangeRates,
    );
  };

  const filteredProductsCount = selectedCategories.reduce(
    (total, cat) => total + (groupedProducts[cat]?.length || 0),
    0,
  );

  const downloadAsImage = async () => {
    if (!listContainerRef.current) return;
    setIsExporting(true);

    try {
      // Scale optimized for mobile fitting and clarity
      const canvas = await html2canvas(listContainerRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure cloned element is visible for capture
          const el = clonedDoc.querySelector('[data-capture-area="true"]');
          if (el) (el as HTMLElement).style.display = 'block';
        },
      });

      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${storeName.replace(/\s+/g, '_')}_Fiyat_Listesi.jpg`;
      link.click();
    } catch (error) {
      console.error('Fotoğraf oluşturulamadı:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const printAsPDF = () => {
    window.print();
  };

  const footer = (
    <div className="w-full">
      {step === 0 ? (
        <div className="flex flex-col gap-2 w-full">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="!w-full h-12 shadow-none"
              mode="rectangle"
            >
              GERİ GİT
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(1)}
              className="!w-full h-12 !bg-stone-900 !text-white text-xs font-black uppercase shadow-xl shadow-stone-200"
              mode="rectangle"
            >
              BAŞLA
            </Button>
          </div>
          <Button
            onClick={() => {
              localStorage.setItem('ekatalog_skip_price_list_intro', 'true');
              setStep(1);
            }}
            variant="ghost"
            size="sm"
            mode="rectangle"
            className="!w-full h-10 !text-[10px] font-black !text-stone-400 hover:!text-stone-900 uppercase tracking-widest transition-all shadow-none"
          >
            Bu bilgilendirmeyi tekrar gösterme
          </Button>
        </div>
      ) : step === 1 ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep(0)}
            className="!w-full h-12 shadow-none"
            mode="rectangle"
            icon={<ArrowLeft size={16} />}
          >
            GERİ
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setStep(2)}
            disabled={selectedCategories.length === 0}
            className="!w-full h-12 shadow-lg shadow-stone-200"
            mode="rectangle"
          >
            LİSTEYİ GÖR
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            size="md"
            icon={<ArrowLeft size={16} />}
            onClick={() => setStep(1)}
            className="w-full h-12 shadow-none"
            mode="rectangle"
          >
            GERİ GİT
          </Button>
          <div className="flex gap-2 w-full">
            <Button
              variant="primary"
              size="md"
              icon={<Download size={18} />}
              onClick={downloadAsImage}
              loading={isExporting}
              className="flex-1 h-12 shadow-lg"
              mode="rectangle"
            >
              KAYDET
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Printer size={18} />}
              onClick={printAsPDF}
              className="w-12 shrink-0 h-12 flex items-center justify-center p-0"
              mode="rectangle"
            ></Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={step === 2 ? 'max-w-4xl' : 'max-w-xl'}
      title={step > 0 ? 'Fiyat Listesi Asistanı' : undefined}
      progress={{ current: step + 1, total: 3 }}
      footer={footer}
    >
      <div className="print:p-0 min-h-[300px]">
        {step === 0 ? (
          <div className="py-2 px-1 flex flex-col items-center">
            <div className="flex items-center gap-5 mb-8 w-full px-4">
              <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center shadow-sm border border-stone-100 rotate-2 text-stone-900 shrink-0">
                <Layers3 size={32} />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tighter text-left leading-tight">
                Fiyat Listemizi Galerinize İndirin
                <InfoHint
                  message="Liste fotoğraf formatında iner, böylece WhatsApp'tan paylaşmak veya arşivlemek çok kolay olur!"
                  className="ml-2"
                />
              </h4>
            </div>

            <div className="w-full text-left bg-stone-50 p-4 sm:p-6 rounded-3xl border border-stone-100 space-y-4 mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-white text-stone-900 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm border border-stone-100">
                  1
                </div>
                <p className="text-xs font-bold text-stone-600">
                  İndirmek istediğiniz ürün kategorilerimizi seçin.
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-white text-stone-900 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm border border-stone-100">
                  2
                </div>
                <p className="text-xs font-bold text-stone-600">
                  İndir tuşuna tıklayın.
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-white text-stone-900 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm border border-stone-100">
                  3
                </div>
                <p className="text-xs font-bold text-stone-600">
                  Galerinize bakın.
                </p>
              </div>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 italic">
              İşte bu kadar kolay!
            </p>
          </div>
        ) : step === 1 ? (
          <div className="p-2">
            <div className="mb-6 px-2 flex items-end justify-between">
              <div>
                <h5 className="text-xs font-black text-stone-900 uppercase tracking-[0.2em] mb-1">
                  KATEGORİ SEÇİMİ
                </h5>
                <p className="text-[11px] text-stone-400 font-medium italic">
                  Seçmek istediğiniz kategorilerin üzerine tıklayınız
                </p>
              </div>
              <Button
                onClick={selectAllCategories}
                variant="secondary"
                mode="rectangle"
                size="sm"
                className="!flex !items-center !gap-1.5 !text-[9px] font-black !text-stone-900 hover:!text-stone-600 transition-colors !bg-stone-100 !px-3 !py-1.5 !rounded-lg whitespace-nowrap shrink-0 border-none shadow-none"
                icon={
                  selectedCategories.length === populatedCategories.length ? (
                    <CheckSquare size={14} />
                  ) : (
                    <Square size={14} />
                  )
                }
              >
                HEPSİNİ SEÇ
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {populatedCategories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => handleToggleCategory(cat)}
                  variant="ghost"
                  mode="rectangle"
                  className={`
                      !flex !items-center !justify-between !p-4 !rounded-2xl border-2 transition-all group !h-auto shadow-none
                      ${
                        selectedCategories.includes(cat)
                          ? '!bg-stone-900 !border-stone-900 !text-white shadow-xl scale-[1.02]'
                          : '!bg-white !border-stone-100 !text-stone-600 hover:!border-stone-300'
                      }
                    `}
                >
                  <span className="font-black text-[11px] uppercase tracking-tight">
                    {cat}
                  </span>
                  <div
                    className={`
                      px-2.5 py-1 rounded-lg flex items-center justify-center text-[10px] font-black
                      ${
                        selectedCategories.includes(cat)
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-50 text-stone-400'
                      }
                    `}
                  >
                    {groupedProducts[cat]?.length || 0} ADET
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 bg-stone-50/30 print:bg-white print:p-0">
            <div
              ref={listContainerRef}
              data-capture-area="true"
              className="bg-white p-4 sm:p-8 rounded-[40px] shadow-sm border border-stone-100 print:shadow-none print:border-none print:p-0 overflow-hidden"
            >
              {/* LIST HEADER */}
              <div className="flex flex-col mb-10 border-b-8 border-stone-900 pb-8 relative pt-4 text-center items-center">
                <div className="absolute top-0 px-6 py-1.5 bg-stone-900 text-white rounded-b-2xl shadow-xl">
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] opacity-80">
                    {window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1'
                      ? `${storeName.toUpperCase()}.EKATALOG.SITE`
                      : window.location.hostname.toUpperCase()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tighter mt-10 uppercase px-4">
                  {storeName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-[1px] bg-stone-200"></div>
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.4em]">
                    FİYAT LİSTESİ
                  </p>
                  <div className="w-8 h-[1px] bg-stone-200"></div>
                </div>

                <div className="mt-8 flex gap-4 sm:gap-6 text-center">
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-black text-stone-300 uppercase tracking-widest">
                      GÜNCELLEME
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-black text-stone-900">
                      {new Date().toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="w-[1px] h-6 sm:h-8 bg-stone-100"></div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-black text-stone-300 uppercase tracking-widest">
                      KATEGORİ
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-black text-stone-900">
                      {selectedCategories.length} REYON
                    </p>
                  </div>
                  <div className="w-[1px] h-6 sm:h-8 bg-stone-100"></div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-black text-stone-300 uppercase tracking-widest">
                      TOPLAM
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-black text-stone-900">
                      {filteredProductsCount} ÜRÜN
                    </p>
                  </div>
                </div>

                {activeDiscount && (
                  <div className="mt-6 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 inline-flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tight">
                      Kupon İndirimi %{activeDiscount.rate * 100} Dahildir
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-10 pb-10">
                {selectedCategories.map((cat) => {
                  const categoryProducts = groupedProducts[cat];
                  if (!categoryProducts || categoryProducts.length === 0)
                    return null;

                  return (
                    <div key={cat} className="break-inside-avoid">
                      <div className="flex items-center gap-3 mb-5">
                        <h2 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight shrink-0">
                          {cat}
                        </h2>
                        <div className="h-[1px] flex-1 bg-stone-100"></div>
                      </div>

                      <div className="space-y-2 sm:space-y-2.5">
                        {categoryProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-start justify-between gap-3 sm:gap-4 p-2.5 sm:p-3.5 rounded-[20px] sm:rounded-[28px] border border-stone-50 bg-white hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md sm:rounded-lg border border-stone-100 shadow-sm shrink-0 bg-white"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg border border-stone-100 bg-stone-50 shrink-0 flex items-center justify-center">
                                  <Layers3
                                    size={18}
                                    className="opacity-20 text-stone-900"
                                  />
                                </div>
                              )}
                              <div className="flex flex-col min-w-0 py-0.5">
                                <h4 className="font-black text-stone-900 text-[11px] sm:text-xs leading-tight uppercase tracking-tight">
                                  {product.name}
                                </h4>
                                <p className="text-[8px] sm:text-[9px] text-stone-400 font-bold mt-0.5 line-clamp-1 leading-normal">
                                  {product.description || 'Standart Ürün'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 pt-0.5">
                              <span className="text-[12px] sm:text-[14px] font-black text-stone-900 tracking-tighter">
                                {calculateFinalPrice(product)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-10 border-t border-stone-100 text-center flex flex-col items-center">
                <p className="text-[7px] sm:text-[8px] font-black text-stone-300 uppercase tracking-[0.4em] mb-4">
                  WWW.EKATALOG.SITE
                </p>
                <div className="px-4 py-1.5 bg-stone-50 rounded-full text-[7px] sm:text-[8px] font-black text-stone-400 border border-stone-100 lowercase">
                  {storeName.toLowerCase().replace(/\s+/g, '')}@ekatalog.site
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
