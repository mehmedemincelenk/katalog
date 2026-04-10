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
            <div className="flex items-center gap-3 mt-1">
              <button 
                onClick={() => window.open(settings.instagram, '_blank')}
                className="text-stone-400 hover:text-stone-900 transition-colors p-1"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </button>
            </div>
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
