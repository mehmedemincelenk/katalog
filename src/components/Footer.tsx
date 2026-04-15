import { useState, useCallback, useMemo } from 'react';
import { THEME, LABELS } from '../data/config';
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

export default function Footer({ isAdmin, activeDiscount, onApplyDiscount, discountError, settings }: FooterProps) {
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
              <div className="w-full">
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
                      ${isInputEmpty ? '!bg-stone-200' : '!bg-green-600 shadow-lg shadow-green-600/20 scale-105'}
                    `}
                  >
                    {globalIcons.check}
                  </button>
                </div>

                {/* STATUS FEEDBACK */}
                <div className={footerTheme.coupons.statusWrapper}>
                  {couponStatus === 'success' && (
                    <span className={`${footerTheme.coupons.statusText} ${footerTheme.coupons.successText}`}>
                      ✓ %{(activeDiscount?.rate || 0) * 100} İndirim Uygulandı
                    </span>
                  )}
                  {couponStatus === 'error' && (
                    <span className={`${footerTheme.coupons.statusText} ${footerTheme.coupons.errorText}`}>
                      ⚠ {discountError}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE BRANDING SECTION */}
        <div className="mt-8 flex justify-center">
          <p className="text-[10px] font-light text-black uppercase tracking-[0.2em] select-none opacity-90">
            ekatalog | {settings?.title}
          </p>
        </div>
      </div>

      {/* BOTTOM THIN BAR - Hidden for now */}
      {false && (
        <div className={footerTheme.bottomBar.layout} onClick={() => window.open('https://wa.me/905550000000?text=E-Katalog%20bilgisi%20almak%20istiyorum', '_blank')}>
          <p className={footerTheme.bottomBar.text}>
            <span className="text-amber-400">e-katalog</span> 200₺/ay • 
            <span className="ml-2 inline-flex items-center group-hover:scale-105 transition-transform">
              Hemen Al <span className="inline-block animate-bounce ml-1.5">👆</span>
            </span>
          </p>
        </div>
      )}
    </footer>
  );
}
