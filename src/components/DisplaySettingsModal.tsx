import { memo } from 'react';
import { THEME } from '../data/config';
import { CompanySettings } from '../hooks/useSettings';
import Button from './Button';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  updateSetting: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void;
}

const DisplaySettingsModal = memo(({ isOpen, onClose, settings, updateSetting }: DisplaySettingsModalProps) => {
  if (!isOpen) return null;

  const config = settings.displayConfig;
  const theme = THEME.addProductModal; // Reuse modal styles for consistency
  const globalIcons = THEME.icons;

  const toggleOption = (key: keyof CompanySettings['displayConfig']) => {
    const updatedConfig = { ...config, [key]: !config[key] };
    updateSetting('displayConfig', updatedConfig);
  };

  const options = [
    { key: 'showLogo', label: 'Mağaza Logosu', icon: '🖼️' },
    { key: 'showSubtitle', label: 'Slogan / Alt Metin', icon: '📝' },
    { key: 'showAddress', label: 'Adres Bilgisi', icon: '📍' },
    { key: 'showInstagram', label: 'Instagram İkonu', icon: '📸' },
    { key: 'showWhatsapp', label: 'WhatsApp Butonu', icon: '💬' },
    { key: 'showSearch', label: 'Arama Kutusu', icon: '🔍' },
    { key: 'showCategories', label: 'Kategori Çipleri', icon: '🏷️' },
    { key: 'showReferences', label: 'Referanslar', icon: '🤝' },
  ] as const;

  return (
    <div className={theme.overlay} onClick={onClose}>
      <div className={`${theme.container} max-w-[280px]`} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex flex-col">
            <h2 className="text-sm font-black tracking-tight text-stone-900 leading-none">Görünüm Ayarları</h2>
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Stilini Belirle</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-full transition-colors">
            <div className="w-4 h-4 text-stone-400">{globalIcons.close}</div>
          </button>
        </div>

        {/* BODY (Grid Layout) */}
        <div className="p-3 grid grid-cols-2 gap-2">
          {options.map((option) => (
            <div 
              key={option.key}
              onClick={() => toggleOption(option.key)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center group ${
                config[option.key] 
                  ? 'border-stone-900 bg-stone-900 text-white shadow-lg scale-[0.98]' 
                  : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
              }`}
            >
              <span className={`text-xl transition-all duration-300 ${config[option.key] ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'grayscale opacity-70 group-hover:grayscale-0'}`}>
                {option.icon}
              </span>
              <span className="text-[8px] font-black uppercase tracking-tighter mt-1 leading-none line-clamp-1">
                {option.label.split(' ')[0]}
              </span>
              {/* Mini Status Dot with Glow Effect */}
              <div className={`w-1 h-1 rounded-full mt-1.5 transition-all duration-300 ${config[option.key] ? 'bg-white shadow-[0_0_5px_white]' : 'bg-transparent'}`} />
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-3 pt-0">
          <Button 
            onClick={onClose} 
            variant="primary" 
            size="md" 
            mode="rectangle" 
            className="w-full !rounded-2xl" 
          >
            KAPAT
          </Button>
        </div>
      </div>
    </div>
  );
});

export default DisplaySettingsModal;
