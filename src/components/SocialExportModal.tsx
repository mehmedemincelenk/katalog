import { useRef, useState, useMemo, useEffect } from 'react';
import BaseModal from './BaseModal';
import Button from './Button';
import * as Lucide from 'lucide-react';
import html2canvas from 'html2canvas';
import { useStore } from '../store';
import { getActiveStoreSlug } from '../utils/core';
import { Product } from '../types';
import { MarketingGallery } from './MarketingGallery';

/**
 * PAZARLAMA MODALI (v11.0 - El Emeği Serisi)
 * -----------------------------------------------------------
 * Fabrika yok. Prosedürel üretim yok.
 * MarketingGallery içinden özgün tasarımlar kullanılır.
 * Sadece "EKATALOG". 
 * Modern, Sade, Zeki.
 */


export default function SocialExportModal({ 
  isOpen, 
  onClose,
  products = [] 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  products?: Product[];
}) {
  const { settings } = useStore();
  const storeName = settings?.title || 'EKATALOG';
  const slug = getActiveStoreSlug();
  const storeUrl = `${slug}.ekatalog.site`;

  // --- GALLERY STATE ---
  const [designIndex, setDesignIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'STORY' | 'POST'>('STORY'); // STORY: 9:16, POST: 16:9
  const designRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[Math.floor(Math.random() * products.length)].id);
    }
  }, [isOpen, products, selectedProductId]);

  const activeProduct = useMemo(() => {
    if (!selectedProductId) return products[0] || null;
    return products.find(p => p.id === selectedProductId) || products[0] || null;
  }, [selectedProductId, products]);

  // --- ACTIONS ---
  const handleNextDesign = () => {
    setDesignIndex((prev) => (prev + 1) % MarketingGallery.length);
  };

  const handleProductChange = () => {
    if (products.length <= 1) return;
    let nextIdx;
    const currentIdx = products.findIndex(p => p.id === selectedProductId);
    do { nextIdx = Math.floor(Math.random() * products.length); } while (nextIdx === currentIdx);
    setSelectedProductId(products[nextIdx].id);
  };

  const handleDownload = async () => {
    if (!designRef.current) return;
    setIsExporting(true);
    
    const isPost = aspectRatio === 'POST';
    const width = isPost ? 640 : 360;
    const height = isPost ? 360 : 640;

    const captureEl = document.createElement('div');
    captureEl.style.position = 'fixed'; 
    captureEl.style.left = '-9999px'; 
    captureEl.style.top = '0';
    captureEl.style.width = `${width}px`; 
    captureEl.style.height = `${height}px`; 
    captureEl.style.zIndex = '-1';
    captureEl.innerHTML = designRef.current.innerHTML;
    document.body.appendChild(captureEl);
    
    try {
      const canvas = await html2canvas(captureEl, { 
        scale: 3, 
        useCORS: true, 
        width: width, 
        height: height, 
        logging: false, 
        backgroundColor: null 
      });
      const link = document.createElement('a'); 
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `EKATALOG_${aspectRatio}_${Date.now()}.jpg`; 
      link.click();
    } catch (err) { 
      console.error(err); 
    } finally { 
      document.body.removeChild(captureEl); 
      setIsExporting(false); 
    }
  };

  const CurrentDesign = MarketingGallery[designIndex];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="İNDİR-PAYLAŞ" maxWidth="max-w-md">
      <div className="flex flex-col items-center gap-8 py-4">
         
         {/* MAIN ACTIONS */}
         <div className="w-full px-10 flex gap-4">
            <Button 
               variant="primary" 
               onClick={handleNextDesign} 
               icon={<Lucide.RotateCw size={18} className={isExporting ? 'animate-spin' : ''} />}
               className="flex-1 !rounded-2xl !h-14 !bg-stone-900 hover:!bg-black !text-white !font-black !tracking-widest uppercase shadow-xl"
            >
               YENİ TASARIM
            </Button>
            <Button 
               variant="secondary" 
               onClick={handleDownload} 
               loading={isExporting} 
               icon={<Lucide.Download size={20} />}
               className="!w-24 !h-14 !rounded-2xl shadow-xl border-2 border-stone-200 !bg-white !text-stone-900 !font-black uppercase tracking-widest"
            />
         </div>

         {/* PREVIEW CONTAINER - OPTIMIZED SCALE */}
         <div className="relative transition-all duration-500 scale-90 sm:scale-100">
            <div 
              className={`
                w-[260px] h-[462px] rounded-[3rem] 
                shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden border-[10px] border-stone-950 relative bg-stone-50 transition-all duration-500
              `}
            >
               <div 
                  ref={designRef} 
                  className={`
                    w-[360px] h-[640px] scale-[0.722] 
                    absolute top-0 left-0 origin-top-left bg-white relative overflow-hidden transition-all duration-500
                  `}
               >
                  {activeProduct && (
                    <CurrentDesign 
                      product={activeProduct} 
                      storeName={storeName} 
                      storeUrl={storeUrl} 
                      onProductClick={handleProductChange}
                      aspectRatio={aspectRatio}
                    />
                  )}
               </div>
            </div>
         </div>

         {/* SMART GUIDANCE */}
         <div className="flex flex-col items-center gap-4 pb-6 text-center">
            <p className="text-[14px] font-black text-stone-900 tracking-tighter uppercase italic">HİKAYENDE PAYLAŞ</p>
            <p className="text-[10px] text-stone-400 font-medium px-12 leading-tight">
               Ürün fotoğrafına dokunarak ürünü, butona basarak tasarımı değiştirebilirsin.
            </p>
         </div>

      </div>
    </BaseModal>
  );
}
