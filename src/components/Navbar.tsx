// FILE ROLE: Global Navigation & Brand Header
// DEPENDS ON: THEME, CompanySettings, Image Utilities, Contact Helpers
// CONSUMED BY: App.tsx
import { memo, useState, useEffect } from 'react';
import { THEME, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';
import { generateWhatsAppLink } from '../utils/contact';
import { resolveVisualAssetUrl, compressVisualToDataUri } from '../utils/image';
import { X } from 'lucide-react';
import QuickEditModal from './QuickEditModal';

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
  updateSetting: (key: keyof CompanySettings, value: CompanySettings[keyof CompanySettings]) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
}

const Navbar = memo(({ onLogoPointerDown, onLogoPointerUp, isAdmin, isInlineEnabled, settings, updateSetting, search, onSearchChange }: NavbarProps) => {
  const theme = THEME.navbar;
  const globalIcons = THEME.icons;
  const [isLogoPressed, setIsLogoPressed] = useState(false);
  const [internalSearch, setInternalSearch] = useState(search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) onSearchChange(internalSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [internalSearch, onSearchChange]);

  useEffect(() => {
    if (search !== undefined) setInternalSearch(search);
  }, [search]);

  const handlePressStart = () => {
    setIsLogoPressed(true);
    onLogoPointerDown();
  };

  const handlePressEnd = () => {
    setIsLogoPressed(false);
    onLogoPointerUp();
  };

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

  const [quickEdit, setQuickEdit] = useState<{ key: keyof CompanySettings, value: string, title: string } | null>(null);

  const handleInstagramAction = () => {
    if (isAdmin) {
      const currentUrl = settings.instagram || '';
      const currentUsername = currentUrl.split('instagram.com/').pop()?.replace(/\//g, '') || '';
      
      setQuickEdit({
        key: 'instagram',
        value: currentUsername,
        title: 'Instagram Adresi'
      });
      return;
    }
    if (settings.instagram) window.open(settings.instagram, '_blank');
  };

  const handleTextEdit = (key: keyof CompanySettings, current: string, label: string) => {
    if (!isAdmin || isInlineEnabled) return;
    setQuickEdit({
      key,
      value: current,
      title: label
    });
  };

  const handleQuickSave = (newVal: string) => {
    if (!quickEdit) return;
    
    if (quickEdit.key === 'instagram') {
      const sanitized = newVal.trim().replace(/^@/, '');
      updateSetting('instagram', sanitized ? `https://www.instagram.com/${sanitized}` : '');
    } else {
      updateSetting(quickEdit.key, newVal);
    }
    setQuickEdit(null);
  };

  const editStyle = isAdmin ? "outline-none focus:ring-0 rounded px-1 -mx-1 transition-colors duration-200 hover:bg-stone-50 cursor-text motion-fix" : "";

  const config = settings.displayConfig;
  const isRightSideVisible = config.showInstagram || config.showAddress || config.showWhatsapp;
  const isTitleOnly = !isRightSideVisible && !config.showLogo && !config.showSubtitle;

  const announcementBarTheme = THEME.announcementBar;
  const announcementConfig = settings.announcementBar ?? { enabled: false, text: '' };
  const [isBarDismissed, setIsBarDismissed] = useState(() => sessionStorage.getItem('ekatalog_banner_dismissed') === 'true');

  const showAnnouncementBar = announcementConfig.enabled && announcementConfig.text && !isBarDismissed;

  const handleDismiss = () => {
    setIsBarDismissed(true);
    sessionStorage.setItem('ekatalog_banner_dismissed', 'true');
  };

  const handleAnnouncementBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newText = e.currentTarget.textContent?.trim() || '';
    if (newText !== announcementConfig.text) {
      updateSetting('announcementBar', { ...announcementConfig, text: newText });
    }
  };

  return (
    <>
      {/* ANNOUNCEMENT BAR: Admin-editable, customer-dismissable top banner */}
      {(showAnnouncementBar || (isAdmin && announcementConfig.enabled)) && (
        <div className={announcementBarTheme.wrapper}>
          <span
            className={`${announcementBarTheme.text} ${isAdmin && isInlineEnabled ? announcementBarTheme.adminEditStyle : ''}`}
            contentEditable={isAdmin && isInlineEnabled}
            suppressContentEditableWarning
            onBlur={handleAnnouncementBlur}
          >
            {announcementConfig.text || (isAdmin ? 'Duyuru metnini buraya yazın...' : '')}
          </span>
          {!isAdmin && (
            <button onClick={handleDismiss} className={announcementBarTheme.closeButton} aria-label="Duyuruyu kapat">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <nav className={theme.layout}>
        <div className={theme.container}>
          <div className={`${theme.innerWrapper} ${isTitleOnly ? 'justify-center' : 'justify-between'}`}>
          
          {/* LEFT SIDE: Brand & Search Grouped */}
          <div className="flex items-center flex-1 gap-2 sm:gap-8 min-w-0">
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
              {/* INVISIBLE SHIELD: Explicitly handles gestures when NOT admin to avoid bubbling issues */}
              {!isAdmin && (
                <div 
                  className="absolute inset-0 z-[40] cursor-pointer touch-none" 
                  onPointerDown={handlePressStart}
                  onPointerUp={handlePressEnd}
                  onPointerLeave={handlePressEnd}
                  onPointerCancel={handlePressEnd}
                />
              )}

              {settings.displayConfig.showLogo && (
                <div 
                  onClick={() => isAdmin && document.getElementById('logo-upload-input')?.click()}
                  className={`${theme.brand.logoWrapper} select-none touch-none cursor-pointer overflow-hidden flex items-center justify-center relative z-[30] ${!isAdmin ? 'pointer-events-none' : ''}`}
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

              <div className={`${theme.brand.textWrapper} cursor-pointer relative z-[30] ${!isAdmin ? 'pointer-events-none' : ''}`}>
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

            {/* SEARCH BOX FOR DESKTOP */}
            {settings.displayConfig.showSearch && onSearchChange && (
              <div className="hidden sm:flex items-center flex-1 max-w-md mr-4">
                <div className="relative w-full">
                  <div className="absolute left-3 sm:left-[18px] top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[24px] sm:h-[24px] text-stone-400">{globalIcons.search}</div>
                  <input 
                    type="text" 
                    value={internalSearch} 
                    onChange={(e) => setInternalSearch(e.target.value)}
                    placeholder="Ara..."
                    className="w-full pl-9 sm:pl-[60px] pr-4 sm:pr-[24px] py-1.5 sm:py-[12px] border border-stone-200 text-xs sm:text-[18px] font-semibold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none transition-colors duration-200 bg-stone-50/50 rounded-md sm:rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CONTACT & ADDRESS SECTION (Stacked Layout on Mobile, Inline on Desktop) */}
          {isRightSideVisible && (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 shrink-0">
              {/* Desktop Address (Left of Insta) */}
              {settings.displayConfig.showAddress && (
                <div 
                  contentEditable={isAdmin && isInlineEnabled}
                  suppressContentEditableWarning
                  onBlur={(e) => updateSetting('address', e.currentTarget.textContent || '')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                  onClick={() => handleTextEdit('address', settings.address, 'Adres')}
                  className={`text-[11px] sm:text-[18px] text-stone-400 hover:text-stone-900 transition-colors font-medium text-left leading-tight hidden sm:block ${editStyle}`}
                >
                  {settings.address}
                </div>
              )}

              {/* Top Row: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Instagram */}
                {settings.displayConfig.showInstagram && (
                  <div 
                    onClick={handleInstagramAction} 
                    className={`w-7 h-7 sm:w-[38px] sm:h-[38px] sm:rounded-xl rounded-md bg-white/40 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-75 cursor-pointer shadow-xl ${isAdmin ? 'text-pink-600 ring-2 ring-pink-100' : 'text-stone-400 hover:text-pink-600'}`}
                    title={isAdmin ? 'Instagram Adresini Güncelle' : ''}
                  >
                    <div className="w-4 h-4 sm:w-[26px] sm:h-[26px]">
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
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-[14px] py-1.5 sm:py-[8px] bg-stone-900 text-white rounded-md sm:rounded-xl transition-all active:scale-95 shadow-xl hover:bg-black cursor-pointer border border-white/10"
                  >
                    <div className="w-3 h-3 sm:w-[20px] sm:h-[20px]">{globalIcons.whatsapp}</div>
                    <span 
                      contentEditable={isAdmin && isInlineEnabled}
                      suppressContentEditableWarning
                      onBlur={(e) => updateSetting('whatsapp', e.currentTarget.textContent || '')}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                      className={`text-[9px] sm:text-[12px] font-bold tracking-tight outline-none ${isAdmin && isInlineEnabled ? 'min-w-[50px] focus:bg-white/10' : ''}`}
                    >
                      {settings.whatsapp || 'SİPARİŞ VER'}
                    </span>
                  </div>
                )}
              </div>
  
              {/* Bottom Row / Mobile Address */}
              {settings.displayConfig.showAddress && (
                <div 
                  contentEditable={isAdmin && isInlineEnabled}
                  suppressContentEditableWarning
                  onBlur={(e) => updateSetting('address', e.currentTarget.textContent || '')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                  onClick={() => handleTextEdit('address', settings.address, 'Adres')}
                  className={`text-[9px] text-stone-400 hover:text-stone-900 transition-colors font-medium text-right leading-tight sm:hidden ${editStyle}`}
                >
                  {settings.address}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
    <QuickEditModal 
      isOpen={!!quickEdit} 
      onClose={() => setQuickEdit(null)} 
      onSave={handleQuickSave} 
      title={(quickEdit?.title || '') + ' Düzenle'} 
      subtitle={`Dükkanınızdaki ${quickEdit?.title.toLowerCase()} bilgisini buradan güncelleyebilirsiniz.`}
      initialValue={quickEdit?.value || ''} 
      placeholder={`${quickEdit?.title} girin...`}
    />
    </>
  );
});

export default Navbar;
