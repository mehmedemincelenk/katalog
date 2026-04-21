// FILE: src/components/Footer.tsx
// ROLE: Renders the site footer, including social links, promo code input, and administrative QR code triggers
// READS FROM: src/data/config, src/hooks/useSettings
// USED BY: App.tsx

import { useState, useCallback, useMemo } from 'react';
import { THEME, LABELS } from '../data/config';
import { ActiveDiscount } from '../hooks/useDiscount';
import { CompanySettings } from '../hooks/useSettings';

interface FooterProps {
  onLogoClick: () => void;
  onQRClick?: () => void;
  isAdmin: boolean;
  activeDiscount?: ActiveDiscount | null;
  onApplyDiscount?: (code: string) => void;
  discountError?: string | null;
  onDeleteAll?: () => void;
  settings: CompanySettings;
}

// ARCHITECTURE: Footer
// PURPOSE: Displays configured company address, instagram links, dynamic promo code forms, and handles bottom-of-page navigation
// DEPENDENCIES: THEME.footer, CompanySettings
// CONSUMERS: App layout layer
export default function Footer({ isAdmin, activeDiscount, onApplyDiscount, discountError, onQRClick, settings }: FooterProps) {
  const [couponCodeInput, setCouponCodeInput] = useState('');

  const footerTheme = THEME.footer;
  const globalIcons = THEME.icons;

  const handlePromotionApply = useCallback(() => {
    if (onApplyDiscount && couponCodeInput.trim()) {
      onApplyDiscount(couponCodeInput.trim().toUpperCase());
    }
  }, [onApplyDiscount, couponCodeInput]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePromotionApply();
  };

  const couponStatus = useMemo(() => {
    if (activeDiscount) return 'success';
    if (discountError) return 'error';
    return 'default';
  }, [activeDiscount, discountError]);

  const isInputEmpty = couponCodeInput.trim().length === 0;

  return (
    <footer className={footerTheme.layout}>
      <div className={footerTheme.container}>
        <div className={footerTheme.grid}>
          {/* COUPON SECTION */}
          {!isAdmin && (
            <div className={footerTheme.coupons.wrapper}>
              <div className="w-full max-w-sm">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 px-1">İndirim Kuponu</p>
                <div className={footerTheme.coupons.inputWrapper}>
                  <input 
                    type="text" 
                    value={couponCodeInput} 
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())} 
                    onKeyPress={handleKeyPress}
                    placeholder={LABELS.couponPlaceholder} 
                    className={`${footerTheme.coupons.input} ${THEME.radius.input}`} 
                  />
                  <button 
                    onClick={handlePromotionApply} 
                    className={`
                      ${footerTheme.coupons.button} ${THEME.radius.input}
                      ${isInputEmpty ? '!bg-stone-200' : '!bg-stone-900 shadow-xl scale-105'}
                    `}
                  >
                    {globalIcons.check}
                  </button>
                </div>

                {/* STATUS FEEDBACK */}
                <div className={footerTheme.coupons.statusWrapper}>
                  {couponStatus === 'success' && (
                    <span className={`${footerTheme.coupons.statusText} ${footerTheme.coupons.successText} flex items-center gap-1`}>
                      <span className="text-lg">✓</span> %{(activeDiscount?.rate || 0) * 100} İndirim Uygulandı
                    </span>
                  )}
                  {couponStatus === 'error' && (
                    <span className={`${footerTheme.coupons.statusText} ${footerTheme.coupons.errorText} flex items-center gap-1 font-bold`}>
                      <span className="text-lg">⚠</span> {discountError}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE BRANDING SECTION */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="h-[1px] w-12 bg-stone-200 mb-2"></div>
          <p className="text-[10px] font-black text-stone-900 uppercase tracking-[0.3em] select-none">
            ekatalog | {settings?.title || 'Dijital Kart'}
          </p>
          <p className="text-[9px] font-bold text-stone-400 tracking-tighter uppercase">
            Tüm hakları saklıdır. &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* STICKY-LIKE QR BUTTON BAR */}
      {onQRClick && (
        <div className="mt-12 border-t border-stone-100 bg-stone-50/50">
          <button 
            onClick={onQRClick}
            className="w-full py-6 px-4 flex items-center justify-center gap-4 transition-all hover:bg-stone-900 hover:text-white group"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm border border-stone-100 group-hover:bg-stone-800 group-hover:border-stone-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-900 group-hover:text-white transition-colors">
                <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16h.01"/><path d="M16 12h1"/><path d="M21 12h.01"/><path d="M12 21h.01"/>
              </svg>
            </div>
            <div className="flex flex-col items-start gap-0.5 text-left">
              <span className="text-[11px] font-black tracking-[0.1em] uppercase">Masaüstü QR Kodu</span>
              <span className="text-[9px] font-bold text-stone-400 group-hover:text-stone-300 transition-colors uppercase tracking-tight italic">Müşterilerinize okutmak için tıklayın</span>
            </div>
          </button>
        </div>
      )}
    </footer>
  );
}
