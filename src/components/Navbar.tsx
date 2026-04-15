import { memo } from 'react';
import { THEME, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';

/**
 * NAVBAR COMPONENT (Layout Correction)
 * -----------------------------------------------------------
 * Address is positioned UNDER social/whatsapp buttons.
 * Phone number is correctly pulled from settings.whatsapp.
 */

interface NavbarProps {
  onLogoPointerDown: () => void;
  onLogoPointerUp: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  settings: CompanySettings;
}

const Navbar = memo(({ onLogoPointerDown, onLogoPointerUp, onLogout, isAdmin, settings }: NavbarProps) => {
  const theme = THEME.navbar;
  const globalIcons = THEME.icons;

  const handleLogoClick = () => {
    if (isAdmin) {
      onLogout();
    }
  };

  const handleWhatsAppAction = () => {
    const storeWhatsAppNumber = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const encodedMessage = encodeURIComponent(`Merhaba, web sitenizden ulaşıyorum.`);
    window.open(`https://wa.me/${storeWhatsAppNumber.replace(/\s+/g, '')}?text=${encodedMessage}`, '_blank');
  };

  const handleInstagramAction = () => {
    if (settings.instagram) window.open(settings.instagram, '_blank');
  };

  return (
    <nav className={theme.layout}>
      <div className={theme.container}>
        <div className={theme.innerWrapper}>
          
          {/* BRAND SECTION (Logo & Identity) */}
          <div className={theme.brand.wrapper}>
            <div 
              onPointerDown={onLogoPointerDown}
              onPointerUp={onLogoPointerUp}
              onPointerLeave={onLogoPointerUp}
              onClick={handleLogoClick}
              className={`${theme.brand.logoWrapper} select-none touch-none cursor-default`}
              style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none', 
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'none'
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {settings.logoEmoji?.startsWith('data:image') ? (
                <img src={settings.logoEmoji} alt="Store Logo" className={theme.brand.logoImg} />
              ) : (
                <span className={theme.brand.logoEmoji}>{settings.logoEmoji || DEFAULT_COMPANY.logoEmoji}</span>
              )}
            </div>

            <div className={theme.brand.textWrapper}>
              <div className="flex items-center">
                <span className={theme.brand.name}>{settings.title}</span>
                {isAdmin && <span className={theme.brand.adminBadge}>ADMIN</span>}
              </div>
              <span className={theme.brand.tagline}>{settings.subtitle}</span>
            </div>
          </div>

          {/* CONTACT & ADDRESS SECTION (Stacked Layout) */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Top Row: Actions */}
            <div className="flex items-center gap-2">
              {/* Instagram */}
              <div onClick={handleInstagramAction} className="text-stone-400 hover:text-pink-600 transition-all active:scale-75 cursor-pointer">
                <div className="w-4 h-4 sm:w-5 sm:h-5">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </div>
              </div>

              {/* WhatsApp Button */}
              <button onClick={handleWhatsAppAction} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-stone-900 text-white rounded-md transition-all active:scale-95 shadow-sm hover:bg-black">
                <div className="w-3 h-3 sm:w-4 sm:h-4">{globalIcons.whatsapp}</div>
                <span className="text-[9px] sm:text-[10px] font-medium tracking-tight">{settings.whatsapp || 'SİPARİŞ VER'}</span>
              </button>
            </div>

            {/* Bottom Row: Address */}
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] sm:text-[11px] text-stone-400 hover:text-stone-900 transition-colors font-medium text-right leading-tight"
            >
              {settings.address}
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
});

export default Navbar;
