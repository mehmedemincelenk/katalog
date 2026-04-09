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

// --- İKON KÜTÜPHANESİ (Heroicons Style - Tutarlı Aile) ---
const ICONS = {
  settings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.894.15c.542.09.94.56.94 1.109v1.094c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 0 1-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
  add: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  select: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  power: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" /></svg>,
  close: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>,
  hamburger: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
};

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
      // EĞER SEÇİM MODUNDAYSAK, DIŞARI TIKLAMAK ÜRÜN SEÇMEKTİR, MENÜYÜ KAPATMA!
      if (isSelectMode) return;

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isSelectMode]);

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
    // isSelectMode durumuna bakılmaksızın menu acık kalsın (Kullanıcı kendi kapatsın)
    if (!isOpen) setIsOpen(true);
  };

  return (
    // TEK BİR BUZLU CAM KUTUSU (Tekil Konteyner)
    <div 
      ref={menuRef} 
      className="fixed bottom-6 right-6 z-[100] p-2.5 bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-[2.5rem] flex flex-col items-center gap-3 transition-all duration-300"
    >
      
      {/* ÜST KATMAN: GENİŞLEYEN ARAÇLAR */}
      {isOpen && (
        <div className="flex flex-col items-center gap-3 w-full animate-in slide-in-from-bottom-5 fade-in duration-300 pb-2 border-b border-white/20">
          
          {/* SİTE AYARLARI */}
          {showSettings && !isSelectMode && (
            <div className="flex flex-col items-center gap-2 w-full pt-2">
              <FloatingButton onClick={() => handlePromptUpdate('title', 'Marka Adı', settings.title)} icon="🏷️" label="Başlık" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('subtitle', 'Alt Başlık', settings.subtitle)} icon="👤" label="Alt" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('whatsapp', 'WhatsApp No', settings.whatsapp)} icon="💬" label="WhatsApp" variant="secondary" className="text-green-600 border-green-100" />
              <FloatingButton onClick={() => handlePromptUpdate('instagram', 'Instagram Link', settings.instagram)} icon="📸" label="Instagram" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('address', 'Firma Adresi', settings.address)} icon="📍" label="Adres" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('logoEmoji', 'Logo Emojisi', settings.logoEmoji || DEFAULT_COMPANY.logoEmoji)} icon="✨" label="Logo" variant="secondary" />
            </div>
          )}

          {/* TOPLU İŞLEMLER (YAZI TABANLI, 2x2 IZGARA) */}
          {isSelectMode && selectedCount > 0 && (
            <div className="flex flex-col items-center gap-2 w-full pt-2">
              <div className="bg-stone-900 text-white text-[10px] font-black px-4 py-2 rounded-full mb-2 shadow-lg">
                {selectedCount} SEÇİLİ
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <FloatingButton onClick={() => onDelete?.()} icon={<span className="text-[11px] font-black tracking-widest uppercase">SİL</span>} showLabel={false} variant="secondary" className="!w-full text-red-600 border-red-100" />
                <FloatingButton onClick={() => onArchiveToggle?.()} icon={<span className="text-[11px] font-black tracking-widest uppercase">ARŞİV</span>} showLabel={false} variant="secondary" className="!w-full" />
                <FloatingButton onClick={() => onStockToggle?.()} icon={<span className="text-[11px] font-black tracking-widest uppercase">STOK</span>} showLabel={false} variant="secondary" className="!w-full" />
                
                <div className="relative group/cat w-full">
                  <FloatingButton onClick={() => {}} icon={<span className="text-[11px] font-black tracking-widest uppercase">REYON</span>} showLabel={false} variant="secondary" className="!w-full" />
                  <select 
                    onChange={(e) => { if(e.target.value) { onChangeCategory?.(e.target.value); e.target.value = ""; } }}
                    value=""
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none z-[5]"
                  >
                    <option value="" disabled>Seç...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <FloatingButton onClick={() => onChangeName?.()} icon={<span className="text-[11px] font-black tracking-widest uppercase">AÇIKLAMA</span>} showLabel={false} variant="secondary" className="!w-full" />
                <FloatingButton onClick={() => onChangePrice?.()} icon={<span className="text-[11px] font-black tracking-widest uppercase">FİYAT</span>} showLabel={false} variant="secondary" className="!w-full" />
              </div>
            </div>
          )}

          {/* ANA AKSİYONLAR */}
          {!isSelectMode && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <FloatingButton 
                onClick={() => setShowSettings(!showSettings)} 
                icon={ICONS.settings} 
                label="Ayarlar" 
                variant="secondary" 
                className={showSettings ? 'border-kraft-400 text-kraft-600' : ''}
              />
              <FloatingButton onClick={() => { onAddClick(); setIsOpen(false); }} icon={ICONS.add} label="Ekle" variant="secondary" />
            </div>
          )}
          
          {/* ÇOKLU SEÇİM TOGGLE (Her zaman görünür) */}
          <div className="pt-1">
            <FloatingButton 
              onClick={handleToggleSelectMode} 
              icon={isSelectMode ? ICONS.close : ICONS.select} 
              label={isSelectMode ? 'Kapat' : 'Seç'} 
              variant="secondary"
              className={isSelectMode ? 'bg-kraft-600 text-white border-kraft-700' : ''}
            />
          </div>
        </div>
      )}

      {/* ALT KATMAN: SABİT BUTONLAR (YATAY DİZİLİM) */}
      <div className="flex flex-row gap-3 items-center justify-between w-full">
        {/* ÇIKIŞ BUTONU */}
        <FloatingButton 
          onClick={onLogout} 
          icon={ICONS.power} 
          label="Çıkış" 
          variant="secondary" 
          className="text-red-600 border-red-100"
        />

        {/* HAMBURGER BUTONU (İkon Sabit Kalır, Aç kapa yapar) */}
        <FloatingButton 
          onClick={() => { setIsOpen(!isOpen); if(isOpen) setShowSettings(false); }} 
          icon={ICONS.hamburger}
          label="Menü"
          variant="secondary"
          className={`${isOpen ? 'bg-stone-100 border-stone-300' : 'border-stone-200'}`}
        />
      </div>

    </div>
  );
}
