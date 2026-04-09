import { useState } from 'react';
import { COMPANY, FOOTER, LABELS } from '../data/config';
import { ActiveDiscount } from '../hooks/useDiscount';

/**
 * FOOTER BİLEŞENİ (TEORİK ANALİZ)
 * ----------------------------
 * Bir girişimci olarak burayı sitenin "Resmi Kimliği" ve "Satış Dönüştürücü" alanı olarak görebilirsin.
 * 
 * 1. Marka Güveni: Logo ve telif hakları ile kurumsallığı pekiştirir.
 * 2. Erişilebilirlik: Lokasyon bilgisi ile fiziksel varlığı kanıtlar.
 * 3. Satış Teşviki (Kupon): Kullanıcıyı sepete yönlendirmek için son bir "avantaj" sunar.
 */

interface FooterProps {
  onLogoClick: () => void;
  isAdmin: boolean;
  activeDiscount?: ActiveDiscount | null;
  onApplyDiscount?: (code: string) => void;
  discountError?: string | null;
}

export default function Footer({ 
  onLogoClick, 
  isAdmin,
  activeDiscount,
  onApplyDiscount,
  discountError
}: FooterProps) {
  // TEKNİK NOT: couponInput, kullanıcının o an yazdığı metni tutan "geçici" bir hafızadır.
  const [couponInput, setCouponInput] = useState('');

  /**
   * handleApply (İŞ MANTIĞI):
   * Kullanıcı butona bastığında, yazdığı kodu büyük harfe çevirerek (Upper Case) 
   * sisteme göndeririz. Eğer hata yoksa kutuyu temizleriz.
   */
  const handleApply = () => {
    if (onApplyDiscount && couponInput.trim()) {
      onApplyDiscount(couponInput.trim());
      if (!discountError) setCouponInput('');
    }
  };

  const f = FOOTER; // Kısa erişim için config alias

  return (
    <footer className="bg-white border-t border-stone-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className={`grid grid-cols-1 md:grid-cols-3 ${f.style.sectionGap} items-start`}>
          
          {/* 1. BÖLÜM: MARKA VE TELİF */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <button onClick={onLogoClick} className="flex items-center gap-2 group outline-none">
              <span className="text-3xl group-active:scale-90 transition-transform">{COMPANY.logoEmoji}</span>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-bold text-stone-900 tracking-tight text-lg">{COMPANY.name}</span>
                <span className="text-[11px] text-kraft-600 mt-0.5">{COMPANY.tagline}</span>
              </div>
              {/* ADMİN MODU: Sadece kurucu olarak sen içerideysen bu etiketi görürsün. */}
              {isAdmin && (
                <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
                  {LABELS.adminModeActive}
                </span>
              )}
            </button>
            <p className="text-[10px] text-stone-400 text-center md:text-left leading-relaxed">
              {f.labels.rightsReserved(COMPANY.name)}
            </p>
          </div>

          {/* 2. BÖLÜM: LOKASYON (Google Haritalar Entegrasyonu) */}
          <div className="flex flex-col items-center gap-2 text-center">
            <span className={`text-[10px] font-bold text-stone-300 uppercase ${f.style.tracking} mb-1`}>
              {f.labels.locationTitle}
            </span>
            <a 
              href={`${f.style.mapBaseUrl}${encodeURIComponent(COMPANY.address)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors max-w-[200px] leading-relaxed"
            >
              {COMPANY.address}
            </a>
          </div>

          {/* 3. BÖLÜM: KUPON SİSTEMİ (Girişimci Dokunuşu) */}
          {!isAdmin && (
            <div className="flex flex-col items-center md:items-end gap-2.5">
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
            </div>
          )}
          
        </div>
      </div>
    </footer>
  );
}
