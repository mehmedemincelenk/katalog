import { memo, useState, useEffect } from 'react';
import { CompanySettings } from '../hooks/useSettings';
import Button from './Button';
import BaseModal from './BaseModal';
import { HelpCircle } from 'lucide-react';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  updateSetting: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void;
  isInlineEnabled: boolean;
  onToggleInline: () => void;
}

interface HelpInfo {
  title: string;
  onText: string;
  offText: string;
}

const DisplaySettingsModal = memo(({ isOpen, onClose, settings, updateSetting, isInlineEnabled, onToggleInline }: DisplaySettingsModalProps) => {
  const config = settings.displayConfig;
  const [helpId, setHelpId] = useState<string | null>(null);
  const [hiddenHelpIds, setHiddenHelpIds] = useState<string[]>([]);

  useEffect(() => {
    const hidden = localStorage.getItem('ekatalog_hidden_help_ids');
    if (hidden) setHiddenHelpIds(JSON.parse(hidden));
  }, []);

  const hideHelpPermanently = (id: string) => {
    const updated = [...hiddenHelpIds, id];
    setHiddenHelpIds(updated);
    localStorage.setItem('ekatalog_hidden_help_ids', JSON.stringify(updated));
    setHelpId(null);
  };

  const toggleOption = (key: keyof CompanySettings['displayConfig']) => {
    const updatedConfig = { ...config, [key]: !config[key] };
    updateSetting('displayConfig', updatedConfig);
  };

  const announcementConfig = settings.announcementBar ?? { enabled: false, text: '' };
  const toggleAnnouncement = () => {
    updateSetting('announcementBar', { ...announcementConfig, enabled: !announcementConfig.enabled });
  };

  const maintenanceConfig = settings.maintenanceMode ?? { enabled: false, message: '' };
  const toggleMaintenance = () => {
    updateSetting('maintenanceMode', { ...maintenanceConfig, enabled: !maintenanceConfig.enabled });
  };

  const helpContents: Record<string, HelpInfo> = {
    'inline': {
      title: 'Hızlı Düzenleme Nedir?',
      onText: 'Dükkanınızdaki ürünlerin isimlerine, fiyatlarına veya açıklamalarına doğrudan tıklayarak anında değiştirebilirsiniz. "Kaydet" butonu aramaya gerek kalmadan her şey tıkır tıkır güncellenir.',
      offText: 'Ürünlerin üzerine tıklandığında sadece ürün detayı açılır. Yanlışlıkla bir şeyleri değiştirme riskini ortadan kaldırmak için bu modu kapalı tutabilirsiniz.'
    }
  };

  const groups = [
    {
      title: "ŞUNLAR GÖZÜKSÜN",
      subtitle: "Dükkanınızdaki bölümlerin görünürlük ayarları",
      options: [
        { key: 'showPrice', label: 'Ürünlerin Fiyatları', isOn: config.showPrice, onToggle: () => toggleOption('showPrice') },
        { key: 'showWhatsapp', label: 'WhatsApp Hattı', isOn: config.showWhatsapp, onToggle: () => toggleOption('showWhatsapp') },
        { key: 'showInstagram', label: 'Instagram Sayfası', isOn: config.showInstagram, onToggle: () => toggleOption('showInstagram') },
        { key: 'showAddress', label: 'Adres Bilgisi', isOn: config.showAddress, onToggle: () => toggleOption('showAddress') },
        { key: 'showCarousel', label: 'Ana Sayfa Afişleri', isOn: config.showCarousel, onToggle: () => toggleOption('showCarousel') },
        { key: 'showReferences', label: 'Referans Bölümü', isOn: config.showReferences, onToggle: () => toggleOption('showReferences') },
        { key: 'announcement', label: 'Duyuru Panosu', isOn: announcementConfig.enabled, onToggle: toggleAnnouncement },
      ]
    },
    {
      title: "ŞUNLAR KULLANILABİLSİN",
      subtitle: "Müşterilerin dükkanda yapabileceği işlemler",
      options: [
        { key: 'showCoupons', label: 'İndirim Kuponu', isOn: config.showCoupons, onToggle: () => toggleOption('showCoupons') },
        { key: 'showCurrency', label: '₺ $ € Çevirici', isOn: config.showCurrency, onToggle: () => toggleOption('showCurrency') },
        { key: 'showPriceList', label: 'Fiyat Listesi', isOn: config.showPriceList, onToggle: () => toggleOption('showPriceList') },
      ]
    },
    {
      title: "YÖNETİCİ AYARLARI",
      subtitle: "Sistem ve dükkan yönetimi kontrolleri",
      options: [
        { key: 'inline', label: 'Hızlı Düzenleme', isOn: isInlineEnabled, onToggle: onToggleInline, hasHelp: true },
        { key: 'maintenance', label: 'Bakım Moduna Al', isOn: maintenanceConfig.enabled, onToggle: toggleMaintenance },
      ]
    }
  ];

  const footer = (
    <Button onClick={onClose} variant="primary" size="md" mode="rectangle" className="w-full !rounded-[var(--radius-card)] !py-5 !text-[16px]">
      KAPAT VE KAYDET
    </Button>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-md"
        title="Mağaza Özellikleri"
        subtitle="Dükkanınızı isteğinize göre yapılandırın"
        footer={footer}
      >
        <div className="space-y-8 pb-4">
          {groups.map((group) => (
            <div key={group.title} className="space-y-3">
              <div className="px-1 border-l-4 border-stone-900 pl-4 py-1">
                <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">{group.title}</h5>
                <p className="text-[11px] text-stone-400 font-medium italic leading-none mt-1">{group.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                {group.options.map((option) => (
                  <div
                    key={option.key}
                    onClick={option.onToggle}
                    className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer group h-12 ${
                      option.isOn
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xl scale-[0.98]'
                        : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      {option.hasHelp && !hiddenHelpIds.includes(option.key) && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setHelpId(option.key); }}
                          className={`shrink-0 p-0.5 transition-all ${option.isOn ? 'text-emerald-400' : 'text-stone-300 hover:text-stone-900'}`}
                        >
                          <HelpCircle size={16} />
                        </button>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-tight leading-none truncate">
                        {option.label}
                      </span>
                    </div>
                    
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 shrink-0 ${
                      option.isOn 
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] border border-emerald-300' 
                        : 'bg-stone-200'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </BaseModal>

      {/* REUSABLE HELP MODAL */}
      <BaseModal
        isOpen={!!helpId}
        onClose={() => setHelpId(null)}
        maxWidth="max-w-sm"
        title={helpId ? helpContents[helpId]?.title : ''}
        footer={
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={() => setHelpId(null)} variant="primary" size="md" className="w-full !py-4" mode="rectangle">
                TAMAM
            </Button>
            <Button 
                onClick={() => helpId && hideHelpPermanently(helpId)} 
                variant="ghost" 
                size="sm" 
                className="w-full text-stone-400 !text-[9px] font-black hover:text-stone-900 underline px-6 text-center leading-tight" 
                mode="rectangle"
            >
                Anladım, bu butondaki "?" işaretini tekrar göstermene gerek yok
            </Button>
          </div>
        }
      >
        {helpId && (
          <div className="space-y-4 py-2">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <div className="flex gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-[10px]">AÇIK</div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-bold">{helpContents[helpId].onText}</p>
                </div>
            </div>
            <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl">
                <div className="flex gap-3">
                    <div className="w-6 h-6 bg-stone-300 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-[10px]">KAPALI</div>
                    <p className="text-xs text-stone-600 leading-relaxed font-bold">{helpContents[helpId].offText}</p>
                </div>
            </div>
          </div>
        )}
      </BaseModal>
    </>
  );
});

export default DisplaySettingsModal;
