import { useState } from 'react';
import { LABELS, DEFAULT_COMPANY } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';
import FloatingButton from './FloatingButton';

interface FloatingAdminMenuProps {
  settings: CompanySettings;
  updateSetting: (key: keyof CompanySettings, value: string) => void;
  onAddClick: () => void;
  isSelectMode: boolean;
  toggleSelectMode: () => void;
  onLogout: () => void;
}

export default function FloatingAdminMenu({
  settings, updateSetting, onAddClick, isSelectMode, toggleSelectMode, onLogout
}: FloatingAdminMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const promptUpdate = (key: keyof CompanySettings, title: string, currentValue: string) => {
    const newVal = window.prompt(`${title} için yeni değer girin:`, currentValue);
    if (newVal !== null && newVal.trim() !== '') {
      updateSetting(key, newVal.trim());
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      
      {/* Genişleyen Menü Öğeleri */}
      {isOpen && (
        <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <FloatingButton onClick={() => promptUpdate('title', 'Marka Adı', settings.title)} icon="🏷️" label="Başlık" />
          <FloatingButton onClick={() => promptUpdate('subtitle', 'Alt Başlık', settings.subtitle)} icon="👤" label="Alt Başlık" />
          <FloatingButton onClick={() => promptUpdate('whatsapp', 'WhatsApp', settings.whatsapp)} icon="💬" label="WhatsApp" variant="success" />
          <FloatingButton onClick={() => promptUpdate('instagram', 'Instagram', settings.instagram)} icon="📸" label="Instagram" />
          <FloatingButton onClick={() => promptUpdate('address', 'Adres', settings.address)} icon="📍" label="Adres" />
          <FloatingButton onClick={() => promptUpdate('logoEmoji', 'Logo', settings.logoEmoji || DEFAULT_COMPANY.logoEmoji)} icon="✨" label="Logo Emojisi" />
          
          <div className="w-8 h-px bg-stone-200 my-1"></div>

          <FloatingButton onClick={() => { onAddClick(); setIsOpen(false); }} icon="+" label={LABELS.newProductBtn} variant="primary" />
          <FloatingButton 
            onClick={() => { toggleSelectMode(); setIsOpen(false); }} 
            icon={isSelectMode ? '✕' : '✅'} 
            label={isSelectMode ? 'Seçimi Kapat' : 'Çoklu Seç'} 
            variant={isSelectMode ? 'kraft' : 'secondary'} 
          />
        </div>
      )}

      {/* Alt Kontroller (Hamburger + Çıkış) */}
      <div className="flex gap-3">
        <FloatingButton 
          onClick={() => setIsOpen(!isOpen)} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          }
          label="Admin Araçları"
          variant="secondary"
          className="border-stone-300"
        />

        <FloatingButton 
          onClick={onLogout} 
          icon="🚪" 
          label={LABELS.adminCloseBtn} 
          variant="primary" 
        />
      </div>

    </div>
  );
}
