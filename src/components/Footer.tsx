import { useState, memo, useCallback } from 'react';
import { THEME, LABELS, DEFAULT_COMPANY } from '../data/config';
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

export default function Footer({ onLogoClick, isAdmin, activeDiscount, onApplyDiscount, discountError, onDeleteAll, settings }: FooterProps) {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isQrCodeFullscreen, setIsQrCodeFullscreen] = useState(false);

  const footerTheme = THEME.footer;
  const globalIcons = THEME.icons;
  const globalColors = THEME.colors;

  const handlePromotionApply = useCallback(() => {
    if (onApplyDiscount && couponCodeInput.trim()) {
      onApplyDiscount(couponCodeInput.trim());
      if (!discountError) setCouponCodeInput('');
    }
  }, [onApplyDiscount, couponCodeInput, discountError]);

  return (
    <footer className={footerTheme.layout}>
      <div className={footerTheme.container}>
        <div className={footerTheme.grid}>
          
          {/* LOGO & ADMIN TRIGGER AREA */}
          <div className={footerTheme.brand.wrapper}>
            <div 
              onClick={(e) => { e.preventDefault(); onLogoClick(); }}
              className={`flex items-center gap-2 group outline-none text-left select-none cursor-pointer active:scale-90 transition-transform duration-75`}
              style={{ userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
            >
              {settings.logoEmoji?.startsWith('data:image') ? (
                <img src={settings.logoEmoji} alt="Store Logo" className={`${footerTheme.brand.logoImg} ${THEME.radius.logo}`} />
              ) : (
                <span className={footerTheme.brand.logoEmoji}>{settings.logoEmoji || DEFAULT_COMPANY.logoEmoji}</span>
              )}
              <div className="flex flex-col items-start leading-none">
                <span className={footerTheme.brand.name}>{settings.title}</span>
                <span className={footerTheme.brand.tagline}>{settings.subtitle}</span>
              </div>
              {isAdmin && (
                <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded uppercase animate-pulse">
                  {LABELS.adminModeActive}
                </span>
              )}
            </div>
            
            <div className={footerTheme.brand.socialLinks}>
              <button onClick={() => window.open(settings.instagram, '_blank')} className="text-stone-400 hover:text-stone-900 transition-colors p-1" aria-label="Instagram">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </button>
            </div>
            <p className={footerTheme.brand.copyright}>© {new Date().getFullYear()} {settings.title}. {LABELS.rightsReservedText}</p>
          </div>

          {/* ... Rest of footer (Location, Coupons) stays the same ... */}
          <div className={footerTheme.location.wrapper}>
            <div className="flex flex-col items-center gap-2">
              <span className={footerTheme.location.label}>{LABELS.locationTitle}</span>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer" className={footerTheme.location.addressLink}>{settings.address}</a>
            </div>
          </div>

          <div className={footerTheme.coupons.wrapper}>
            {!isAdmin ? (
              <div className={footerTheme.coupons.inputWrapper}>
                <input type="text" value={couponCodeInput} onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())} placeholder={LABELS.couponPlaceholder} className={footerTheme.coupons.input} />
                <button onClick={handlePromotionApply} className={footerTheme.coupons.button + " bg-stone-900"}>{globalIcons.check}</button>
              </div>
            ) : (
              <button onClick={onDeleteAll} className={`px-4 py-2 ${globalColors.danger} rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm`}>Tüm Ürünleri Sil 🗑️</button>
            )}
          </div>
          
        </div>
      </div>
    </footer>
  );
}
