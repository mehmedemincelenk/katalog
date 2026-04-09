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
  delete: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.108 0 0 0-7.5 0" /></svg>,
  archive: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>,
  stock: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  tag: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182L11.159 3.659A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>,
  edit: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>,
  price: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
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

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-3">
      
      {/* ÜST KATMAN: GENİŞLEYEN ARAÇLAR */}
      {isOpen && (
        <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 pb-2">
          
          {/* ALT KATMAN 1: SİTE AYARLARI (İç İçe Menü) */}
          {showSettings && !isSelectMode && (
            <div className="flex flex-col items-center gap-2 mb-2 p-2 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl animate-in zoom-in-95 duration-200">
              <FloatingButton onClick={() => handlePromptUpdate('title', 'Marka Adı', settings.title)} icon="🏷️" label="Başlık" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('subtitle', 'Alt Başlık', settings.subtitle)} icon="👤" label="Alt Başlık" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('whatsapp', 'WhatsApp No', settings.whatsapp)} icon="💬" label="WhatsApp" variant="success" />
              <FloatingButton onClick={() => handlePromptUpdate('instagram', 'Instagram Link', settings.instagram)} icon="📸" label="Instagram" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('address', 'Firma Adresi', settings.address)} icon="📍" label="Adres" variant="secondary" />
              <FloatingButton onClick={() => handlePromptUpdate('logoEmoji', 'Logo Emojisi', settings.logoEmoji || DEFAULT_COMPANY.logoEmoji)} icon="✨" label="Logo" variant="secondary" />
            </div>
          )}

          {/* ALT KATMAN 2: TOPLU İŞLEMLER (Sadece ürün seçiliyken çıkar) */}
          {isSelectMode && selectedCount > 0 && (
            <div className="flex flex-col items-center gap-2 mb-2 p-2 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl animate-in zoom-in-95 duration-200 text-stone-900">
              <div className="bg-stone-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full mb-1 whitespace-nowrap shadow-lg">
                {selectedCount} ÜRÜN SEÇİLİ
              </div>
              <FloatingButton onClick={() => onDelete?.()} icon={ICONS.delete} label="Seçilenleri Sil" variant="secondary" className="text-red-600 border-red-100" />
              <FloatingButton onClick={() => onArchiveToggle?.()} icon={ICONS.archive} label="Arşivle / Yayınla" variant="secondary" />
              <FloatingButton onClick={() => onStockToggle?.()} icon={ICONS.stock} label="Stok Durumu" variant="secondary" />
              
              <div className="relative group/cat">
                <FloatingButton onClick={() => {}} icon={ICONS.tag} label="Reyon Değiştir" variant="secondary" />
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

              <FloatingButton onClick={() => onChangeName?.()} icon={ICONS.edit} label="İsimlere Ek Yap" variant="secondary" />
              <FloatingButton onClick={() => onChangePrice?.()} icon={ICONS.price} label="Fiyatları Güncelle" variant="secondary" />
            </div>
          )}

          {/* ORTA KATMAN: ANA AKSİYONLAR */}
          {!isSelectMode ? (
            <>
              <FloatingButton 
                onClick={() => setShowSettings(!showSettings)} 
                icon={showSettings ? ICONS.close : ICONS.settings} 
                label="Site Ayarlarını Düzenle" 
                variant="secondary" 
                className={showSettings ? 'border-kraft-400' : ''}
              />
              <FloatingButton onClick={() => { onAddClick(); setIsOpen(false); }} icon={ICONS.add} label={LABELS.newProductBtn} variant="secondary" />
            </>
          ) : (
            // Seçim modundayken ama ürün seçilmemişken rehber bir etiket gösterilebilir
            selectedCount === 0 && (
              <div className="bg-white/40 backdrop-blur text-stone-800 text-[9px] font-bold px-3 py-2 rounded-xl mb-2 border border-white/20">
                LÜTFEN ÜRÜN SEÇİN
              </div>
            )
          )}
          
          {/* ÇOKLU SEÇİM TOGGLE */}
          <FloatingButton 
            onClick={() => { 
              toggleSelectMode(); 
              if (!isSelectMode) setShowSettings(false); 
              else if (isSelectMode && selectedCount === 0) setIsOpen(false); 
            }} 
            icon={isSelectMode ? ICONS.close : ICONS.select} 
            label={isSelectMode ? 'Seçimi Kapat' : 'Çoklu Seçim'} 
            variant="secondary"
            className={isSelectMode ? 'border-kraft-400' : ''}
          />
        </div>
      )}

      {/* ANA KONTROLLER (ALT SABİT KISIM) */}
      <div className="flex flex-col gap-3">
        {/* HAMBURGER BUTONU (Ana Tetikleyici) */}
        <FloatingButton 
          onClick={() => { setIsOpen(!isOpen); if(isOpen) setShowSettings(false); }} 
          icon={isOpen ? ICONS.close : ICONS.hamburger}
          label="Yönetim Araçları"
          variant="secondary"
          className={`${isSelectMode && !isOpen ? "border-kraft-500 ring-4 ring-kraft-100 shadow-kraft-500/20 shadow-xl" : "border-stone-300"}`}
        />

        {/* ÇIKIŞ BUTONU (En Altta) */}
        <FloatingButton 
          onClick={onLogout} 
          icon={ICONS.power} 
          label={LABELS.adminCloseBtn} 
          variant="secondary" 
          className="text-red-600 border-red-100"
        />
      </div>

    </div>
  );
}
