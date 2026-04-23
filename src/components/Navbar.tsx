// FILE ROLE: Global Navigation & Brand Header
// DEPENDS ON: THEME, CompanySettings, Image Utilities, Contact Helpers
// CONSUMED BY: App.tsx
import { memo, useState, useEffect } from 'react';
import { THEME, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../types';
import { generateWhatsAppLink } from '../utils/store';
import { compressVisualToDataUri } from '../utils/image';
import { X } from 'lucide-react';
import Button from './Button';
import SmartImage from './SmartImage';
import QuickEditModal from './QuickEditModal';

/**
 * NAVBAR COMPONENT (Layout Correction)
 * -----------------------------------------------------------
 * Fully utilizes atomic Button component for all header interactions.
 */

import { useStore } from '../store/useStore';

import { NavbarProps } from '../types';

const Navbar = memo(
  ({ onLogoPointerDown, onLogoPointerUp, isInlineEnabled }: NavbarProps) => {
    const {
      isAdmin,
      settings,
      updateSetting,
      searchQuery: search,
      setSearchQuery: onSearchChange,
    } = useStore();

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

    const [prevSearch, setPrevSearch] = useState(search);
    if (search !== prevSearch) {
      setPrevSearch(search);
      setInternalSearch(search || '');
    }

    const [quickEdit, setQuickEdit] = useState<{
      key: keyof CompanySettings;
      value: string;
      title: string;
    } | null>(null);
    const [isBarDismissed, setIsBarDismissed] = useState(() => {
      if (typeof window === 'undefined') return false;
      return sessionStorage.getItem('ekatalog_banner_dismissed') === 'true';
    });

    if (!settings) return null;

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
      const storeWhatsAppNumber =
        settings.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '';
      const message = `Merhaba, ${settings.title} web sitenizden ulaşıyorum.`;
      window.open(generateWhatsAppLink(storeWhatsAppNumber, message), '_blank');
    };

    const handleLogoUpload = async (file: File) => {
      try {
        const dataUri = await compressVisualToDataUri(file, 400, 0.8);
        updateSetting('logoUrl', dataUri);
      } catch (error) {
        console.error('Logo upload error:', error);
        alert('Logo yüklenirken bir hata oluştu.');
      }
    };

    const handleInstagramAction = () => {
      if (isAdmin) {
        const currentUrl = settings.instagram || '';
        const currentUsername =
          currentUrl.split('instagram.com/').pop()?.replace(/\//g, '') || '';

        setQuickEdit({
          key: 'instagram',
          value: currentUsername,
          title: 'Instagram Adresi',
        });
        return;
      }
      if (settings.instagram) window.open(settings.instagram, '_blank');
    };

    const handleTextEdit = (
      key: keyof CompanySettings,
      current: string,
      label: string,
    ) => {
      if (!isAdmin || isInlineEnabled) return;
      setQuickEdit({
        key,
        value: current,
        title: label,
      });
    };

    const handleQuickSave = (newVal: string) => {
      if (!quickEdit) return;

      if (quickEdit.key === 'instagram') {
        const sanitized = newVal.trim().replace(/^@/, '');
        updateSetting(
          'instagram',
          sanitized ? `https://www.instagram.com/${sanitized}` : '',
        );
      } else {
        updateSetting(quickEdit.key, newVal);
      }
      setQuickEdit(null);
    };

    const editStyle = isAdmin
      ? 'outline-none focus:ring-0 rounded px-1 -mx-1 transition-colors duration-200 hover:bg-stone-50 cursor-text motion-fix'
      : '';

    const config = settings.displayConfig;
    const isRightSideVisible =
      config.showInstagram || config.showAddress || config.showWhatsapp;
    const isTitleOnly =
      !isRightSideVisible && !config.showLogo && !config.showSubtitle;

    const announcementBarTheme = THEME.announcementBar;
    const announcementConfig = settings.announcementBar ?? {
      enabled: false,
      text: '',
    };
    const showAnnouncementBar =
      announcementConfig.enabled && announcementConfig.text && !isBarDismissed;

    const handleDismiss = () => {
      setIsBarDismissed(true);
      sessionStorage.setItem('ekatalog_banner_dismissed', 'true');
    };

    const handleAnnouncementBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
      const newText = e.currentTarget.textContent?.trim() || '';
      if (newText !== announcementConfig.text) {
        updateSetting('announcementBar', {
          ...announcementConfig,
          text: newText,
        });
      }
    };

    return (
      <>
        {/* ANNOUNCEMENT BAR */}
        {(showAnnouncementBar || (isAdmin && announcementConfig.enabled)) && (
          <div className={announcementBarTheme.wrapper}>
            <span
              className={`${announcementBarTheme.text} ${isAdmin && isInlineEnabled ? announcementBarTheme.adminEditStyle : ''}`}
              contentEditable={isAdmin && isInlineEnabled}
              suppressContentEditableWarning
              onBlur={handleAnnouncementBlur}
            >
              {announcementConfig.text ||
                (isAdmin ? 'Duyuru metnini buraya yazın...' : '')}
            </span>
            {!isAdmin && (
              <Button
                onClick={handleDismiss}
                variant="ghost"
                mode="circle"
                size="sm"
                className="!w-6 !h-6 !p-0 !bg-transparent text-white/80 hover:text-white"
                icon={<X className="w-3 h-3" />}
                aria-label="Duyuruyu kapat"
              />
            )}
          </div>
        )}

        <nav className={theme.layout}>
          <div className={theme.container}>
            <div
              className={`${theme.innerWrapper} ${isTitleOnly ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center flex-1 gap-0.5 sm:gap-1.5 min-w-0">
                {/* BRAND SECTION */}
                <div
                  className={`${theme.brand.wrapper} relative flex items-center transition-all duration-200 ${isLogoPressed ? 'scale-95 opacity-80' : 'scale-100'}`}
                  onPointerDown={handlePressStart}
                  onPointerUp={handlePressEnd}
                  onPointerLeave={handlePressEnd}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'none',
                  }}
                >
                  {!isAdmin && (
                    <div
                      className="absolute inset-0 z-[40] cursor-pointer touch-none"
                      onPointerDown={handlePressStart}
                      onPointerUp={handlePressEnd}
                    />
                  )}

                  {settings.displayConfig.showLogo && (
                    <div
                      onClick={() =>
                        isAdmin &&
                        document.getElementById('logo-upload-input')?.click()
                      }
                      className={`${theme.brand.logoWrapper} select-none touch-none cursor-pointer overflow-hidden flex items-center justify-center relative z-[30] ${!isAdmin ? 'pointer-events-none' : ''}`}
                    >
                      <input
                        id="logo-upload-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleLogoUpload(e.target.files[0])
                        }
                      />
                      <SmartImage
                        src={settings.logoUrl || DEFAULT_COMPANY.logoUrl}
                        alt="Store Logo"
                        className="w-9 h-9 sm:w-[3rem] sm:h-[3rem] rounded-[0.25rem]"
                        objectFit="contain"
                      />
                    </div>
                  )}

                  <div
                    className={`${theme.brand.textWrapper} cursor-pointer relative z-[30] ${!isAdmin ? 'pointer-events-none' : ''}`}
                  >
                    <div className="flex items-center">
                      <span
                        contentEditable={isAdmin && isInlineEnabled}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          updateSetting(
                            'title',
                            e.currentTarget.textContent || '',
                          )
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), e.currentTarget.blur())
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTextEdit('title', settings.title, 'Mağaza Adı');
                        }}
                        className={`!text-[0.75rem] sm:!text-[0.9rem] font-black tracking-tighter text-stone-900 ${editStyle}`}
                      >
                        {settings.title}
                      </span>
                    </div>
                    {settings.displayConfig.showSubtitle && (
                      <span
                        contentEditable={isAdmin && isInlineEnabled}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          updateSetting(
                            'subtitle',
                            e.currentTarget.textContent || '',
                          )
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), e.currentTarget.blur())
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTextEdit(
                            'subtitle',
                            settings.subtitle,
                            'Slogan/Açıklama',
                          );
                        }}
                        className={`!text-[0.45rem] sm:!text-[0.55rem] text-stone-400 font-medium ${editStyle}`}
                      >
                        {settings.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* SEARCH BOX */}
                {settings.displayConfig.showSearch && (
                  <div className="hidden sm:flex items-center w-full max-w-[7rem] lg:max-w-[9rem] ml-1 sm:ml-2">
                    <div className="relative w-full">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400">
                        {globalIcons.search}
                      </div>
                      <input
                        type="text"
                        value={internalSearch}
                        onChange={(e) => setInternalSearch(e.target.value)}
                        placeholder="Ara..."
                        className="w-full pl-7 pr-3 py-1.5 sm:py-2 border border-stone-200 text-[0.55rem] sm:text-[0.6rem] font-semibold text-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all duration-200 bg-stone-50/50 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CONTACT & ADDRESS SECTION */}
              {isRightSideVisible && (
                <div className="flex flex-col items-end lg:flex-row lg:items-center gap-1.5 lg:gap-3 shrink-0">
                  {/* Desktop Address */}
                  {settings.displayConfig.showAddress && (
                    <div
                      contentEditable={isAdmin && isInlineEnabled}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        updateSetting(
                          'address',
                          e.currentTarget.textContent || '',
                        )
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        (e.preventDefault(), e.currentTarget.blur())
                      }
                      onClick={() =>
                        handleTextEdit('address', settings.address, 'Adres')
                      }
                      className={`order-2 lg:order-1 !text-[0.45rem] lg:!text-[0.625rem] text-stone-400 hover:text-stone-900 transition-colors font-medium text-right lg:text-left leading-tight lg:whitespace-nowrap px-1 ${editStyle}`}
                    >
                      {settings.address}
                    </div>
                  )}

                  {/* Actions Group */}
                  <div className="order-1 lg:order-2 flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Instagram Button */}
                    {settings.displayConfig.showInstagram && (
                      <Button
                        onClick={handleInstagramAction}
                        variant="secondary"
                        mode="square"
                        size="sm"
                        className={`!w-5 !h-5 sm:!w-6 sm:!h-6 !p-0 !bg-white/40 !backdrop-blur-md !border-white/10 ${isAdmin ? 'text-pink-600 ring-2 ring-pink-100' : 'text-stone-400 hover:text-pink-600 shadow-none'}`}
                        icon={
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4 fill-current"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        }
                      />
                    )}

                    {/* WhatsApp Button */}
                    {settings.displayConfig.showWhatsapp && (
                      <Button
                        onClick={handleWhatsAppAction}
                        variant="primary"
                        mode="rectangle"
                        className="!bg-stone-900 !text-white !h-6 sm:!h-7 !px-2.5 !rounded-lg hover:!bg-black !shadow-lg border-white/10"
                        icon={
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                            {globalIcons.whatsapp}
                          </div>
                        }
                      >
                        <span
                          contentEditable={isAdmin && isInlineEnabled}
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            updateSetting(
                              'whatsapp',
                              e.currentTarget.textContent || '',
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(), e.currentTarget.blur())
                          }
                          className={`!text-[0.45rem] sm:!text-[0.55rem] font-black tracking-tight leading-none ${isAdmin && isInlineEnabled ? 'min-w-[40px] focus:bg-white/10' : ''}`}
                        >
                          {settings.whatsapp || 'SİPARİŞ VER'}
                        </span>
                      </Button>
                    )}
                  </div>
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
  },
);

export default Navbar;
