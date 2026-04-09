import { useState } from 'react';
import { FOOTER, LABELS, DEFAULT_COMPANY } from '../data/config';
import { ActiveDiscount } from '../hooks/useDiscount';
import { CompanySettings } from '../hooks/useSettings';

interface FooterProps {
  onLogoClick: () => void;
  isAdmin: boolean;
  activeDiscount?: ActiveDiscount | null;
  onApplyDiscount?: (code: string) => void;
  discountError?: string | null;
  onDeleteAll?: () => void;
  settings: CompanySettings;
}

export default function Footer({ 
  onLogoClick, 
  isAdmin,
  activeDiscount,
  onApplyDiscount,
  discountError,
  onDeleteAll,
  settings
}: FooterProps) {
  // TEKNİK NOT: couponInput, kullanıcının o an yazdığı metni tutan "geçici" bir hafızadır.
  const [couponInput, setCouponInput] = useState('');
  const [isQRFullscreen, setIsQRFullscreen] = useState(false);

  const handleApply = () => {
    if (onApplyDiscount && couponInput.trim()) {
      onApplyDiscount(couponInput.trim());
      if (!discountError) setCouponInput('');
    }
  };

  const f = FOOTER; // Kısa erişim için config alias
  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  return (
    <footer className="bg-white border-t border-stone-200 mt-16 relative">
      {/* TAM EKRAN QR MODAL */}
      {isQRFullscreen && (
        <div 
          onClick={() => setIsQRFullscreen(false)}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center cursor-pointer animate-in fade-in duration-300"
        >
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
            <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
            <p className="font-bold text-stone-900 uppercase tracking-widest text-sm">Web Sitemize Gidin</p>
            <p className="text-stone-400 text-[10px] uppercase">Kapatmak için herhangi bir yere tıklayın</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className={`grid grid-cols-1 md:grid-cols-3 ${f.style.sectionGap} items-start`}>
          
          {/* 1. BÖLÜM: MARKA VE TELİF */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <button onClick={onLogoClick} className="flex items-center gap-2 group outline-none">
              {settings.logoEmoji?.startsWith('data:image') ? (
                <img src={settings.logoEmoji} alt="Logo" className="w-10 h-10 object-contain rounded-lg group-active:scale-90 transition-transform" />
              ) : (
                <span className="text-3xl group-active:scale-90 transition-transform">{settings.logoEmoji || DEFAULT_COMPANY.logoEmoji}</span>
              )}
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-bold text-stone-900 tracking-tight text-lg">{settings.title}</span>
                <span className="text-[11px] text-kraft-600 mt-0.5">{settings.subtitle}</span>
              </div>
              {/* ADMİN MODU: Sadece kurucu olarak sen içerideysen bu etiketi görürsün. */}
              {isAdmin && (
                <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
                  {LABELS.adminModeActive}
                </span>
              )}
            </button>
            <p className="text-[10px] text-stone-400 text-center md:text-left leading-relaxed">
              {f.labels.rightsReserved(settings.title)}
            </p>
          </div>

          {/* 2. BÖLÜM: LOKASYON & QR */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className={`text-[10px] font-bold text-stone-300 uppercase ${f.style.tracking} mb-1`}>
                {f.labels.locationTitle}
              </span>
              <a 
                href={`${f.style.mapBaseUrl}${encodeURIComponent(settings.address)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-stone-500 hover:text-stone-900 transition-colors max-w-[200px] leading-relaxed"
              >
                {settings.address}
              </a>
            </div>

            {!isAdmin && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <div 
                  onClick={() => setIsQRFullscreen(true)}
                  className="bg-stone-50 p-2 rounded-xl border border-stone-100 shadow-sm cursor-pointer hover:scale-105 transition-transform group"
                >
                  <img src={qrUrl} alt="QR Code" className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">Siteyi Paylaş</span>
              </div>
            )}
          </div>

          {/* 3. BÖLÜM: KUPON VEYA ADMİN AYARLARI */}
          <div className="flex flex-col items-center md:items-end gap-2.5">
            {!isAdmin ? (
              <>
                <span className={`text-[10px] font-bold text-stone-300 uppercase ${f.style.tracking}`}>
                  {f.labels.advantageTitle}
                </span>
                <div className="flex gap-1 w-full max-w-[240px]">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    placeholder={activeDiscount ? f.labels.couponActive : f.labels.couponPlaceholder}
                    className={`flex-1 px-3 py-2 border rounded-lg text-[11px] font-bold transition-all outline-none ${
                      activeDiscount ? 'border-green-500 bg-green-50 text-green-700' : 
                      discountError ? 'border-red-400 bg-red-50 text-red-700' : 'border-stone-200 text-stone-600 bg-white'
                    }`}
                  />
                  <button 
                    onClick={handleApply} 
                    className={`${activeDiscount ? 'bg-green-600' : 'bg-stone-900'} text-white px-3 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                
                {/* BAŞARI DURUMU: Kupon kabul edildiğinde oran gösterilir. */}
                {activeDiscount && (
                  <div className="flex flex-col items-center md:items-end animate-in fade-in slide-in-from-top-1">
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-tight">
                      {f.labels.discountApplied(activeDiscount.rate)}
                    </p>
                    <p className="text-[8px] text-stone-400 font-medium">
                      {f.labels.codeLabel(activeDiscount.code)}
                    </p>
                  </div>
                )}
                {/* HATA DURUMU: Yanlış kod girilirse uyarı verir. */}
                {discountError && <p className="text-[9px] font-bold text-red-500 uppercase tracking-tight">{discountError}</p>}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full md:items-end">
                <button 
                  onClick={onDeleteAll}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  Tüm Ürünleri Sil 🗑️
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </footer>
  );
}
