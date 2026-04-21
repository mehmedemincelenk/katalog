// FILE ROLE: B2B Price List Generator (Export/Print Utility)
// DEPENDS ON: THEME, Product Logic, html2canvas
// CONSUMED BY: FloatingGuestMenu.tsx, Admin Controls
import { useState, useRef, useMemo, useEffect } from 'react';
import { Product } from '../types';
import Button from './Button';
import BaseModal from './BaseModal';
import { transformCurrencyStringToNumber, formatNumberToCurrency } from '../utils/price';
import { TECH } from '../data/config';
import html2canvas from 'html2canvas';
import { Download, Printer, ArrowLeft, Layers3, CheckSquare, Square } from 'lucide-react';

interface PriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: string[];
  displayCurrency: 'TRY' | 'USD' | 'EUR';
  exchangeRates?: { usd: number; eur: number };
  activeDiscount?: { rate: number; category?: string } | null;
  storeName: string;
}

export default function PriceListModal({ 
  isOpen, 
  onClose, 
  products, 
  categories,
  displayCurrency,
  exchangeRates,
  activeDiscount,
  storeName
}: PriceListModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(1); // Step 0 is Intro
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Group products
  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.category || TECH.products.fallbackCategory;
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  // Categories that actually have products
  const populatedCategories = useMemo(() => {
    return categories.filter(cat => (groupedProducts[cat] || []).length > 0);
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
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
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
    const isPromotionActive = activeDiscount && (!activeDiscount.category || activeDiscount.category === product.category);
    const baseMathPrice = transformCurrencyStringToNumber(product.price);
    
    if (isPromotionActive && baseMathPrice > 0) {
      return formatNumberToCurrency(baseMathPrice * (1 - activeDiscount.rate), displayCurrency, exchangeRates);
    }
    return formatNumberToCurrency(baseMathPrice, displayCurrency, exchangeRates);
  };

  const filteredProductsCount = selectedCategories.reduce((total, cat) => total + (groupedProducts[cat]?.length || 0), 0);

  const downloadAsImage = async () => {
    if (!listContainerRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(listContainerRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const image = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${storeName.replace(/\s+/g, '_')}_Fiyat_Listesi.jpg`;
      link.click();
    } catch (error) {
      console.error("Fotoğraf oluşturulamadı:", error);
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
               <Button variant="ghost" size="md" onClick={onClose} className="!w-full h-14" mode="rectangle">
                 GERİ GİT
               </Button>
               <Button 
                 variant="primary" 
                 size="md" 
                 onClick={() => setStep(1)} 
                 className="!w-full h-14 !bg-stone-900 !text-white text-xs font-black uppercase shadow-xl shadow-stone-200"
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
              variant="secondary"
              size="sm"
              mode="rectangle"
              className="!w-full h-10 !text-[10px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-all"
            >
              Bu bilgilendirmeyi tekrar gösterme
            </Button>
         </div>
      ) : step === 1 ? (
         <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" size="md" onClick={() => setStep(0)} className="!w-full h-14" mode="rectangle" icon={<ArrowLeft size={16}/>}>
              GERİ
            </Button>
            <Button 
              variant="primary" 
              size="md" 
              onClick={() => setStep(2)} 
              disabled={selectedCategories.length === 0} 
              className="!w-full h-14 shadow-lg shadow-stone-200"
              mode="rectangle"
            >
              LİSTEYİ GÖR
            </Button>
         </div>
      ) : (
         <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" size="md" icon={<ArrowLeft size={16}/>} onClick={() => setStep(1)} className="w-full h-14" mode="rectangle">
              GERİ GİT
            </Button>
            <div className="flex gap-2 w-full">
              <Button variant="primary" size="md" icon={<Download size={18}/>} onClick={downloadAsImage} loading={isExporting} className="flex-1 h-14 shadow-lg" mode="rectangle">
                KAYDET
              </Button>
              <Button variant="secondary" size="md" icon={<Printer size={18}/>} onClick={printAsPDF} className="w-14 shrink-0 h-14 flex items-center justify-center p-0" mode="rectangle">
              </Button>
            </div>
         </div>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={step === 2 ? "max-w-4xl" : "max-w-xl"}
      title={step > 0 ? "Fiyat Listesi Asistanı" : undefined}
      progress={{ current: step + 1, total: 3 }}
      footer={footer}
    >
      <div className="print:p-0 min-h-[300px]">
          {step === 0 ? (
            <div className="py-6 px-4 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-stone-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-stone-100 rotate-3 text-stone-900">
                <Layers3 size={40} />
              </div>
              <h4 className="text-2xl font-black text-stone-900 mb-4 tracking-tight">Fiyat Listemizi Galerinize İndirin</h4>
              
              <div className="w-full text-left bg-stone-50 p-6 rounded-3xl border border-stone-100 space-y-4 mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-8 bg-white text-stone-900 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm border border-stone-100">1</div>
                  <p className="text-xs font-bold text-stone-600">İndirmek istediğiniz ürün kategorilerimizi seçin.</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-8 bg-white text-stone-900 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm border border-stone-100">2</div>
                  <p className="text-xs font-bold text-stone-600">İndir tuşuna tıklayın.</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-8 bg-white text-stone-900 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm border border-stone-100">3</div>
                  <p className="text-xs font-bold text-stone-600">Galerinize bakın.</p>
                </div>
              </div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 italic">İşte bu kadar kolay!</p>
            </div>
          ) : step === 1 ? (
            <div className="p-2">
              <div className="mb-6 px-2 flex items-end justify-between">
                <div>
                  <h5 className="text-xs font-black text-stone-900 uppercase tracking-[0.2em] mb-1">REYON SEÇİMİ</h5>
                  <p className="text-[11px] text-stone-400 font-medium italic">Hangi kategoriler listelensin?</p>
                </div>
                <button 
                  onClick={selectAllCategories}
                  className="flex items-center gap-1.5 text-[10px] font-black text-stone-900 hover:text-stone-600 transition-colors bg-stone-100 px-3 py-1.5 rounded-lg active:scale-95"
                >
                  {selectedCategories.length === populatedCategories.length ? <CheckSquare size={14} /> : <Square size={14} />}
                  HEPSİNİ SEÇ
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {populatedCategories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl border-2 transition-all group
                      ${selectedCategories.includes(cat) 
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xl scale-[1.02]' 
                        : 'bg-white border-stone-100 text-stone-600 hover:border-stone-300'}
                    `}
                  >
                    <span className="font-black text-[11px] uppercase tracking-tight">{cat}</span>
                    <div className={`
                      px-2.5 py-1 rounded-lg flex items-center justify-center text-[10px] font-black
                      ${selectedCategories.includes(cat) 
                        ? 'bg-white/20 text-white' 
                        : 'bg-stone-50 text-stone-400'}
                    `}>
                      {groupedProducts[cat]?.length || 0} ADET
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 bg-stone-50/30 print:bg-white print:p-0">
              <div 
                ref={listContainerRef} 
                className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 print:shadow-none print:border-none print:p-0 overflow-hidden"
              >
                {/* LIST HEADER */}
                <div className="flex flex-col mb-10 border-b-8 border-stone-900 pb-8 relative pt-4 text-center items-center">
                   <div className="absolute top-0 px-6 py-1.5 bg-stone-900 text-white rounded-b-2xl shadow-xl">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                        {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                          ? `${storeName.toUpperCase()}.EKATALOG.SITE`
                          : window.location.hostname.toUpperCase()}
                      </span>
                   </div>
                   
                   <h1 className="text-4xl font-black text-stone-900 tracking-tighter mt-10 uppercase px-4">{storeName}</h1>
                   <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-[2px] bg-stone-200"></div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">FİYAT LİSTESİ</p>
                      <div className="w-8 h-[2px] bg-stone-200"></div>
                   </div>

                   <div className="mt-8 flex gap-6 text-center">
                      <div>
                        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">GÜNCELLEME</p>
                        <p className="text-xs font-black text-stone-900">{new Date().toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div className="w-[1px] h-8 bg-stone-100"></div>
                      <div>
                        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">KATEGORİ</p>
                        <p className="text-xs font-black text-stone-900">{selectedCategories.length} REYON</p>
                      </div>
                      <div className="w-[1px] h-8 bg-stone-100"></div>
                      <div>
                        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">TOPLAM</p>
                        <p className="text-xs font-black text-stone-900">{filteredProductsCount} ÜRÜN</p>
                      </div>
                   </div>

                   {activeDiscount && (
                      <div className="mt-6 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 inline-flex items-center gap-2">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Kupon İndirimi %{activeDiscount.rate * 100} Dahildir</span>
                      </div>
                   )}
                </div>

                <div className="space-y-12 pb-10">
                  {selectedCategories.map(cat => {
                    const categoryProducts = groupedProducts[cat];
                    if (!categoryProducts || categoryProducts.length === 0) return null;

                    return (
                      <div key={cat} className="break-inside-avoid">
                        <div className="flex items-center gap-4 mb-6">
                           <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight shrink-0">{cat}</h2>
                           <div className="h-[2px] flex-1 bg-stone-100"></div>
                        </div>

                        <div className="space-y-3">
                          {categoryProducts.map(product => (
                            <div key={product.id} className="flex items-start justify-between gap-4 p-4 rounded-[32px] border border-stone-50 bg-white hover:bg-stone-50 transition-colors">
                              <div className="flex gap-4 flex-1 min-w-0">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-14 h-14 object-cover rounded-xl border border-stone-100 shadow-sm shrink-0 bg-white"
                                    crossOrigin="anonymous" 
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl border border-stone-100 bg-stone-50 shrink-0 flex items-center justify-center">
                                    <Layers3 size={24} className="opacity-20 text-stone-900" />
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0 py-1">
                                  <h4 className="font-black text-stone-900 text-sm leading-tight uppercase tracking-tight">{product.name}</h4>
                                  <p className="text-[10px] text-stone-400 font-bold mt-1 line-clamp-2 leading-relaxed">
                                    {product.shortDescription || product.description || 'Standart Ürün'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 pt-1">
                                <span className="text-base font-black text-stone-900 tracking-tighter">
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

                <div className="mt-4 pt-10 border-t-2 border-stone-100 text-center flex flex-col items-center">
                   <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em] mb-4">WWW.EKATALOG.SITE</p>
                   <div className="px-6 py-2 bg-stone-50 rounded-full text-[9px] font-black text-stone-400 border border-stone-100 lowercase">
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
