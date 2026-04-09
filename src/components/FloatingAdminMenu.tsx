import { useState, useEffect, useRef, useCallback } from 'react';
import { LABELS, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';
import FloatingButton from './FloatingButton';

/**
 * FloatingAdminMenu: Admin paneli yönetim merkezini içeren akıllı ve modüler yüzen menü.
 * Engineering & Design Excellence prensiplerine göre uctan uca optimize edilmiştir.
 */
interface FloatingAdminMenuProps {
  settings: CompanySettings;
  updateSetting: (key: keyof CompanySettings, value: string) => void;
  onAddClick: () => void;
  isSelectMode: boolean;
  toggleSelectMode: () => void;
  onLogout: () => void;
  // Toplu İşlem Yetenekleri
  selectedCount?: number;
  categories?: string[];
  onDelete?: () => void;
  onArchiveToggle?: () => void;
  onStockToggle?: () => void;
  onChangeCategory?: (cat: string) => void;
  onChangeName?: () => void;
  onChangePrice?: () => void;
}

export default function FloatingAdminMenu({
  settings, updateSetting, onAddClick, isSelectMode, toggleSelectMode, onLogout,
  selectedCount = 0, categories = [], onDelete, onArchiveToggle, onStockToggle, onChangeCategory, onChangeName, onChangePrice
}: FloatingAdminMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // DIŞARI TIKLAMA KONTROLÜ (Premium UX)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Ayar Güncelleme Yardımcısı
  const handlePromptUpdate = useCallback((key: keyof CompanySettings, title: string, currentValue: string) => {
    const newVal = window.prompt(`${title} için yeni değer girin:`, currentValue);
    if (newVal !== null && newVal.trim() !== '') {
      updateSetting(key, newVal.trim());
    }
    setShowSettings(false);
  }, [updateSetting]);

  // Mod Değiştirme
  const handleToggleSelectMode = () => {
    toggleSelectMode();
    setShowSettings(false);
    // Seçim modundan çıkarken menüleri toparla
    if (isSelectMode) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-3">
      
      {/* ÜST KATMAN: GENİŞLEYEN ARAÇLAR */}
      {isOpen && (
        <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 pb-2">
          
          {/* ALT KATMAN 1: SİTE AYARLARI (İç İçe Menü) */}
          {showSettings && !isSelectMode && (
            <div className="flex flex-col items-center gap-2 mb-2 p-2 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl animate-in zoom-in-95 duration-200">
              <FloatingButton onClick={() => handlePromptUpdate('title', 'Marka Adı', settings.title)} icon="🏷️" label="Başlık" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => handlePromptUpdate('subtitle', 'Alt Başlık', settings.subtitle)} icon="👤" label="Alt Başlık" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => handlePromptUpdate('whatsapp', 'WhatsApp No', settings.whatsapp)} icon="💬" label="WhatsApp" variant="success" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => handlePromptUpdate('instagram', 'Instagram Link', settings.instagram)} icon="📸" label="Instagram" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => handlePromptUpdate('address', 'Firma Adresi', settings.address)} icon="📍" label="Adres" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => handlePromptUpdate('logoEmoji', 'Logo Emojisi', settings.logoEmoji || DEFAULT_COMPANY.logoEmoji)} icon="✨" label="Logo" className="w-10 h-10 text-base" />
            </div>
          )}

          {/* ALT KATMAN 2: TOPLU İŞLEMLER (Sadece ürün seçiliyken çıkar) */}
          {isSelectMode && selectedCount > 0 && (
            <div className="flex flex-col items-center gap-2 mb-2 p-2 bg-stone-900/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-stone-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full mb-1 whitespace-nowrap shadow-lg ring-2 ring-white/20">
                {selectedCount} ÜRÜN SEÇİLİ
              </div>
              <FloatingButton onClick={() => onDelete?.()} icon="🗑️" label="Seçilenleri Sil" variant="danger" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => onArchiveToggle?.()} icon="📦" label="Arşivle / Yayınla" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => onStockToggle?.()} icon="✅" label="Stok Durumu" className="w-10 h-10 text-base" />
              
              <div className="relative group/cat">
                <FloatingButton onClick={() => {}} icon="🏷️" label="Reyon Değiştir" className="w-10 h-10 text-base" />
                <select 
                  onChange={(e) => { if(e.target.value) { onChangeCategory?.(e.target.value); e.target.value = ""; } }}
                  value=""
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none z-[5]"
                >
                  <option value="" disabled>Kategori Seç...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <FloatingButton onClick={() => onChangeName?.()} icon="✏️" label="İsimlere Ek Yap" className="w-10 h-10 text-base" />
              <FloatingButton onClick={() => onChangePrice?.()} icon="💰" label="Fiyatları Güncelle" className="w-10 h-10 text-base" />
            </div>
          )}

          {/* ORTA KATMAN: ANA AKSİYONLAR */}
          {!isSelectMode && (
            <>
              <FloatingButton 
                onClick={() => setShowSettings(!showSettings)} 
                icon={showSettings ? '✕' : '⚙️'} 
                label="Site Ayarlarını Düzenle" 
                variant={showSettings ? 'kraft' : 'secondary'} 
              />
              <FloatingButton onClick={() => { onAddClick(); setIsOpen(false); }} icon="+" label={LABELS.newProductBtn} variant="primary" />
            </>
          )}
          
          {/* ÇOKLU SEÇİM TOGGLE (Her durumda görünür) */}
          <FloatingButton 
            onClick={handleToggleSelectMode} 
            icon={isSelectMode ? '✕' : '✅'} 
            label={isSelectMode ? 'Seçim Modundan Çık' : 'Çoklu İşlem Yap'} 
            variant={isSelectMode ? 'kraft' : 'secondary'} 
          />
        </div>
      )}

      {/* ANA KONTROLLER (ALT SABİT KISIM) */}
      <div className="flex flex-col gap-3">
        {/* HAMBURGER BUTONU (Ana Tetikleyici) */}
        <FloatingButton 
          onClick={() => { setIsOpen(!isOpen); if(isOpen) setShowSettings(false); }} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          }
          label="Yönetim Araçları"
          variant="secondary"
          className={`${isSelectMode && !isOpen ? "border-kraft-500 ring-4 ring-kraft-100 shadow-kraft-500/20 shadow-xl" : "border-stone-300"} bg-stone-50/80 backdrop-blur-md`}
        />

        {/* ÇIKIŞ BUTONU (En Altta) */}
        <FloatingButton 
          onClick={onLogout} 
          icon="🚪" 
          label={LABELS.adminCloseBtn} 
          variant="primary" 
          className="shadow-stone-900/20"
        />
      </div>

    </div>
  );
}
