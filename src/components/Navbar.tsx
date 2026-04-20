import { memo, useState } from 'react';
import { THEME, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';
import { generateWhatsAppLink } from '../utils/contact';
import { resolveVisualAssetUrl, compressVisualToDataUri } from '../utils/image';

/**
 * NAVBAR COMPONENT (Layout Correction)
 * -----------------------------------------------------------
 * Address is positioned UNDER social/whatsapp buttons.
 * Phone number is correctly pulled from settings.whatsapp.
 */

interface NavbarProps {
  onLogoPointerDown: () => void;
  onLogoPointerUp: () => void;
  isAdmin: boolean;
  isInlineEnabled: boolean;
  settings: CompanySettings;
  updateSetting: (key: keyof CompanySettings, value: string) => void;
}

const Navbar = memo(({ onLogoPointerDown, onLogoPointerUp, isAdmin, isInlineEnabled, settings, updateSetting }: NavbarProps) => {
  const theme = THEME.navbar;
  const globalIcons = THEME.icons;
  const [isLogoPressed, setIsLogoPressed] = useState(false);

  const handlePressStart = () => {
    setIsLogoPressed(true);
    onLogoPointerDown();
  };

  const handlePressEnd = () => {
    setIsLogoPressed(false);
    onLogoPointerUp();
  };

  // handleLogoClick removed to enforce long-press for authentication

  const handleWhatsAppAction = () => {
    if (isAdmin && isInlineEnabled) return;
    if (isAdmin && !isInlineEnabled) {
       handleTextEdit('whatsapp', settings.whatsapp || '', 'WhatsApp/Telefon');
       return;
    }
    const storeWhatsAppNumber = settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const message = `Merhaba, ${settings.title} web sitenizden ulaşıyorum.`;
    window.open(generateWhatsAppLink(storeWhatsAppNumber, message), '_blank');
  };

  const handleLogoUpload = async (file: File) => {
    try {
      // Compress logo for database storage (max 400px is plenty for a logo)
      const dataUri = await compressVisualToDataUri(file, 400, 0.8);
      updateSetting('logoUrl', dataUri);
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Logo yüklenirken bir hata oluştu.');
    }
  };

  const handleInstagramAction = () => {
    if (isAdmin) {
      // Akıllı Ayıklama: Mevcut URL'den kullanıcı adını çek
      const currentUrl = settings.instagram || '';
      const currentUsername = currentUrl.split('instagram.com/').pop()?.replace(/\//g, '') || '';
      
      const newUsername = window.prompt('Instagram kullanıcı adınızı girin (örn: toptanambalajcim):', currentUsername);
      
      if (newUsername !== null) {
        const sanitized = newUsername.trim().replace(/^@/, ''); // Baştaki @ işaretini temizle
        if (sanitized) {
          updateSetting('instagram', `https://www.instagram.com/${sanitized}`);
        } else {
          updateSetting('instagram', ''); // Boşsa temizle
        }
      }
      return;
    }
    if (settings.instagram) window.open(settings.instagram, '_blank');
  };

  const handleTextEdit = (key: keyof CompanySettings, current: string, label: string) => {
    if (!isAdmin || isInlineEnabled) return;
    const newVal = window.prompt(`${label} değerini düzenle:`, current);
    if (newVal !== null) {
      updateSetting(key, newVal);
    }
  };

  const editStyle = isAdmin ? "outline-none focus:ring-0 rounded px-1 -mx-1 transition-colors duration-200 hover:bg-stone-50 cursor-text motion-fix" : "";

  const config = settings.displayConfig;
  const isRightSideVisible = config.showInstagram || config.showAddress || config.showWhatsapp;
  const isTitleOnly = !isRightSideVisible && !config.showLogo && !config.showSubtitle;

  return (
    <nav className={theme.layout}>
      <div className={theme.container}>
        <div className={`${theme.innerWrapper} ${isTitleOnly ? 'justify-center' : 'justify-between'}`}>
          
          {/* BRAND SECTION (Logo & Identity) - GESTURE AREA */}
          <div 
            className={`${theme.brand.wrapper} relative transition-all duration-200 ${isLogoPressed ? 'scale-95 opacity-80' : 'scale-100'}`}
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
            onContextMenu={(e) => e.preventDefault()}
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              WebkitTouchCallout: 'none',
              touchAction: 'none'
            }}
          >
            {/* INVISIBLE SHIELD: Prevents native browser context menus on mobile */}
            <div className="absolute inset-0 z-[40] cursor-pointer" />

            {settings.displayConfig.showLogo && (
              <div 
                onClick={() => isAdmin && document.getElementById('logo-upload-input')?.click()}
                className={`${theme.brand.logoWrapper} select-none touch-none cursor-pointer overflow-hidden flex items-center justify-center relative z-[30]`}
              >
                <input 
                  id="logo-upload-input"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                />
                <img 
                  src={resolveVisualAssetUrl(settings.logoUrl) || DEFAULT_COMPANY.logoUrl} 
                  alt="Store Logo" 
                  className={`${theme.brand.logoImg} object-contain`} 
                />
              </div>
            )}

            <div className={`${theme.brand.textWrapper} cursor-pointer relative z-[30]`}>
              <div className="flex items-center">
                <span 
                  contentEditable={isAdmin && isInlineEnabled}
                  suppressContentEditableWarning
                  onBlur={(e) => updateSetting('title', e.currentTarget.textContent || '')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                  onClick={(e) => { e.stopPropagation(); handleTextEdit('title', settings.title, 'Mağaza Adı'); }}
                  className={`${theme.brand.name} ${editStyle}`}
                >
                  {settings.title}
                </span>
              </div>
              {settings.displayConfig.showSubtitle && (
                <span 
                  contentEditable={isAdmin && isInlineEnabled}
                  suppressContentEditableWarning
                  onBlur={(e) => updateSetting('subtitle', e.currentTarget.textContent || '')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                  onClick={(e) => { e.stopPropagation(); handleTextEdit('subtitle', settings.subtitle, 'Slogan/Açıklama'); }}
                  className={`${theme.brand.tagline} ${editStyle}`}
                >
                  {settings.subtitle}
                </span>
              )}
            </div>
          </div>

          {/* CONTACT & ADDRESS SECTION (Stacked Layout) */}
          {isRightSideVisible && (
            <div className="flex flex-col items-end gap-1 shrink-0">
              {/* Top Row: Actions */}
              <div className="flex items-center gap-2">
                {/* Instagram */}
                {settings.displayConfig.showInstagram && (
                  <div 
                    onClick={handleInstagramAction} 
                    className={`w-7 h-7 rounded-md bg-white/40 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-75 cursor-pointer shadow-xl ${isAdmin ? 'text-pink-600 ring-2 ring-pink-100' : 'text-stone-400 hover:text-pink-600'}`}
                    title={isAdmin ? 'Instagram Adresini Güncelle' : ''}
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5">
                      <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </div>
                  </div>
                )}
  
                {/* WhatsApp Button */}
                {settings.displayConfig.showWhatsapp && (
                  <div 
                    onClick={handleWhatsAppAction}
                    className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-md transition-all active:scale-95 shadow-xl hover:bg-black cursor-pointer border border-white/10"
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4">{globalIcons.whatsapp}</div>
                    <span 
                      contentEditable={isAdmin && isInlineEnabled}
                      suppressContentEditableWarning
                      onBlur={(e) => updateSetting('whatsapp', e.currentTarget.textContent || '')}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                      className={`text-[9px] sm:text-[10px] font-bold tracking-tight outline-none ${isAdmin && isInlineEnabled ? 'min-w-[50px] focus:bg-white/10' : ''}`}
                    >
                      {settings.whatsapp || 'SİPARİŞ VER'}
                    </span>
                  </div>
                )}
              </div>
  
              {/* Bottom Row: Address */}
              {settings.displayConfig.showAddress && (
                <div 
                  contentEditable={isAdmin && isInlineEnabled}
                  suppressContentEditableWarning
                  onBlur={(e) => updateSetting('address', e.currentTarget.textContent || '')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                  onClick={() => handleTextEdit('address', settings.address, 'Adres')}
                  className={`text-[9px] sm:text-[11px] text-stone-400 hover:text-stone-900 transition-colors font-medium text-right leading-tight ${editStyle}`}
                >
                  {settings.address}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
});

export default Navbar;
