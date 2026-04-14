import { THEME, LABELS, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';
import React, { useRef, memo, useCallback } from 'react';
import { compressVisualToDataUri } from '../utils/image';

/**
 * NAVBAR COMPONENT (Customer Focused)
 * -----------------------------------------------------------
 */

interface NavbarProps {
  settings: CompanySettings;
  isAdmin?: boolean;
  updateSetting?: (settingKey: keyof CompanySettings, newValue: string) => void;
}

export default function Navbar({ settings, isAdmin, updateSetting }: NavbarProps) {
  const navbarTheme = THEME.navbar;
  const brandIcons = THEME.icons;
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleTextUpdate = useCallback((e: React.MouseEvent, key: keyof CompanySettings, label: string, val: string) => {
    if (!isAdmin || !updateSetting) return;
    e.preventDefault();
    const input = window.prompt(`${label} girin:`, val);
    if (input !== null && input.trim() !== '') updateSetting(key, input.trim());
  }, [isAdmin, updateSetting]);

  return (
    <nav className={navbarTheme.layout}>
      <div className={navbarTheme.container}>
        <div className={navbarTheme.innerWrapper}>
          
          {/* BRAND SECTION: Admin functions only if already logged in */}
          <div className={navbarTheme.brand.wrapper}>
            <div 
              onClick={() => isAdmin ? logoFileInputRef.current?.click() : null}
              className={`${navbarTheme.brand.logoWrapper} ${isAdmin ? 'cursor-pointer' : ''}`}
            >
              {settings.logoEmoji?.startsWith('data:image') ? (
                <img src={settings.logoEmoji} alt="Logo" className={`${navbarTheme.brand.logoImg} ${THEME.radius.logo}`} />
              ) : (
                <span className={navbarTheme.brand.logoEmoji}>{settings.logoEmoji || DEFAULT_COMPANY.logoEmoji}</span>
              )}
              <input ref={logoFileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && updateSetting) {
                  const data = await compressVisualToDataUri(file, 200, 0.8);
                  updateSetting('logoEmoji', data);
                }
              }} />
            </div>

            <div className={navbarTheme.brand.textWrapper}>
              <div className="flex items-center">
                <span 
                  onClick={(e) => isAdmin && handleTextUpdate(e, 'name', 'Şirket Adı', settings.name)}
                  className={`${navbarTheme.brand.name} ${isAdmin ? navbarTheme.brand.editHighlight : ''}`}
                >
                  {settings.name}
                </span>
                {isAdmin && <span className={navbarTheme.brand.adminBadge}>{LABELS.adminModeActive}</span>}
              </div>
              <span 
                onClick={(e) => isAdmin && handleTextUpdate(e, 'subtitle', 'Slogan', settings.subtitle)}
                className={`${navbarTheme.brand.tagline} ${isAdmin ? navbarTheme.brand.editHighlight : ''}`}
              >
                {settings.subtitle}
              </span>
            </div>
          </div>

          {/* CONTACT SECTION */}
          <div className={navbarTheme.contact.wrapper}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={(e) => isAdmin && handleTextUpdate(e, 'address', 'Adres', settings.address)}
              className={`${navbarTheme.contact.address} ${isAdmin ? navbarTheme.brand.editHighlight : ''}`}
            >
              {settings.address}
            </a>

            <div className={navbarTheme.contact.separator} />

            <div className={navbarTheme.contact.actions}>
              {/* INSTAGRAM PORTALI */}
              <button 
                onClick={(e) => isAdmin ? handleTextUpdate(e as any, 'instagram', 'Insta Link', settings.instagram) : window.open(settings.instagram, '_blank')}
                className={`${navbarTheme.contact.instagram} ${navbarTheme.contact.instagramIconSize}`}
                aria-label="Instagram"
              >
                <svg viewBox="0 0 26 26" className="w-full h-full fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </button>

              {/* WHATSAPP DİREKT HAT */}
              <div 
                onClick={(e) => isAdmin && handleTextUpdate(e, 'whatsapp', 'WhatsApp No', settings.whatsapp)}
                className={`${navbarTheme.contact.whatsapp} ${isAdmin ? 'cursor-pointer hover:bg-black' : ''}`}
              >
                {!isAdmin ? (
                  <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <div className={navbarTheme.contact.whatsappIconSize}>{brandIcons.whatsapp}</div>
                    <span className={navbarTheme.contact.phoneText}>{settings.whatsapp}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className={navbarTheme.contact.whatsappIconSize}>{brandIcons.whatsapp}</div>
                    <span className={navbarTheme.contact.phoneText}>{settings.whatsapp}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
