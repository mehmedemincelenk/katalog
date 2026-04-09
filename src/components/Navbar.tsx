import { NAVBAR, FOOTER, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';
import React, { useRef } from 'react';

/**
 * NAVBAR BİLEŞENİ (DÜZENLENEBİLİR VERSİYON)
 * --------------------------------------
 * Admin modundayken Navbar üzerindeki tüm bilgiler (Logo, Ad, Başlık, İletişim)
 * doğrudan tıklanarak güncellenebilir.
 */

interface NavbarProps {
  settings: CompanySettings;
  isAdmin?: boolean;
  updateSetting?: (key: keyof CompanySettings, value: string) => void;
}

export default function Navbar({ settings, isAdmin, updateSetting }: NavbarProps) {
  const n = NAVBAR; 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (e: React.MouseEvent, key: keyof CompanySettings, title: string, currentValue: string) => {
    if (!isAdmin || !updateSetting) return;
    
    // Eğer tıklanan şey bir link ise, admin modundayken linkin gitmesini engelle.
    e.preventDefault();
    
    const newVal = window.prompt(`${title} için yeni değer girin:`, currentValue);
    if (newVal !== null && newVal.trim() !== '') {
      updateSetting(key, newVal.trim());
    }
  };

  const handleLogoUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file || !updateSetting) return;
    try {
      const { compressImage } = await import('../utils/image');
      const compressedStr = await compressImage(file, 200, 0.8) as string;
      updateSetting('logoEmoji', compressedStr);
    } catch {
      alert("Logo yüklenirken hata oluştu.");
    }
    ev.target.value = '';
  };

  const renderLogo = () => {
    const logo = settings.logoEmoji || DEFAULT_COMPANY.logoEmoji;
    const isImage = logo.startsWith('data:image');
    
    return (
      <div 
        onClick={(e) => isAdmin ? fileInputRef.current?.click() : null}
        className={`flex items-center justify-center ${isAdmin ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
      >
        {isImage ? (
          <img src={logo} alt="logo" className="w-10 h-10 object-contain rounded-lg" />
        ) : (
          <span className={n.logo.emojiSize}>{logo}</span>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
      </div>
    );
  };

  return (
    <nav className={`${n.style.bg} ${n.style.border} ${n.style.sticky}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between py-2 items-center gap-4">
          
          {/* 1. BÖLÜM: LOGO VE MARKA KİMLİĞİ */}
          <div className="flex items-center gap-2 select-none shrink-0 cursor-default">
            {renderLogo()}
            <div className="flex flex-col">
              <div 
                onClick={(e) => handleEdit(e, 'title', 'Marka Adı', settings.title)}
                className={`${n.logo.nameSize} ${n.logo.nameWeight} text-stone-900 leading-none tracking-tight ${isAdmin ? 'cursor-pointer hover:bg-stone-100 rounded px-1' : ''}`}
              >
                {settings.title}
              </div>
              <div 
                onClick={(e) => handleEdit(e, 'subtitle', 'Alt Başlık', settings.subtitle)}
                className={`${n.logo.taglineSize} ${n.logo.taglineColor} font-medium ${isAdmin ? 'cursor-pointer hover:bg-stone-100 rounded px-1 mt-0.5' : ''}`}
              >
                {settings.subtitle}
              </div>
            </div>
          </div>

          {/* 2. BÖLÜM: İLETİŞİM VE AKSİYON ALANI */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-0 shrink-0 min-w-0">
            
            {/* FİZİKSEL ADRES */}
            <a
              href={`${FOOTER.style.mapBaseUrl}${encodeURIComponent(settings.address)}`}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => isAdmin && handleEdit(e, 'address', 'Firma Adresi', settings.address)}
              className={`${n.address.size} ${n.address.color} ${n.address.hoverColor} transition-colors whitespace-nowrap order-2 sm:order-1 truncate max-w-[120px] sm:max-w-none ${isAdmin ? 'cursor-pointer hover:bg-stone-100 rounded px-1' : ''}`}
            >
              {settings.address}
            </a>

            <div className={n.address.separator + " order-2"} />

            {/* SOSYAL VE HIZLI MESAJLAŞMA */}
            <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-3">
              {/* Instagram */}
              <button 
                onClick={(e) => isAdmin ? handleEdit(e, 'instagram', 'Instagram Linki', settings.instagram) : window.open(settings.instagram, '_blank')}
                className={`${n.contact.instaColor} ${n.contact.instaHover} transition-all active:scale-90 ${isAdmin ? 'ring-2 ring-stone-100 rounded-full p-1' : ''}`}
              >
                <svg viewBox="0 0 26 26" className={`${n.contact.instaIconSize} fill-current`} aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </button>

              {/* WhatsApp */}
              <div 
                onClick={(e) => isAdmin && handleEdit(e, 'whatsapp', 'WhatsApp Numarası', settings.whatsapp)}
                className={`flex items-center gap-1.5 px-2 py-1 ${n.contact.whatsappBg} ${n.contact.whatsappHover} ${n.contact.whatsappRounded} text-white transition-all active:scale-95 shadow-md ${isAdmin ? 'cursor-pointer ring-2 ring-green-200' : ''}`}
              >
                {!isAdmin ? (
                  <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <WhatsAppIcon size={n.contact.whatsappIconSize} />
                    <span className={`${n.contact.phoneSize} ${n.contact.phoneWeight}`}>{settings.whatsapp}</span>
                  </a>
                ) : (
                  <>
                    <WhatsAppIcon size={n.contact.whatsappIconSize} />
                    <span className={`${n.contact.phoneSize} ${n.contact.phoneWeight}`}>{settings.whatsapp}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function WhatsAppIcon({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${size} fill-current`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.524 5.845L0 24l6.338-1.503A11.927 11.927 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.79 9.79 0 01-5.013-1.381l-.36-.213-3.761.892.944-3.652-.235-.374A9.779 9.779 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
    </svg>
  );
}
