import { useStore } from '../../store';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import StatusToggle from '../ui/StatusToggle';
import * as Lucide from 'lucide-react';
import { DisplaySettingsModalProps, DisplayConfig } from '../../types';

import { THEME } from '../../data/config';
import { storage } from '../../utils/storage';


interface HelpInfo {
  title: string;
  onText: string;
  offText: string;
}

interface SettingOption {
  key: string;
  label: string;
  isOn: boolean;
  onToggle: () => void;
  hasHelp?: boolean;
}

const HELP_CONTENTS: Record<string, HelpInfo> = {
  inline: {
    title: 'Hızlı Düzenleme Nedir?',
    onText:
      'Dükkanınızdaki ürünlerin isimlerine, fiyatlarına veya açıklamalarına doğrudan tıklayarak anında değiştirebilirsiniz.',
    offText:
      'Ürünlerin üzerine tıklandığında sadece ürün detayı açılır.',
  },
  maintenance: {
    title: 'Bakım Modu Nedir?',
    onText:
      'Dükkanınız geçici olarak ziyaretçilere kapatılır.',
    offText:
      'Dükkanınız herkese açıktır.',
  },
};

const SettingCard = ({ 
  option, 
  onHelpTrigger, 
  isHiddenHelp 
}: { 
  option: SettingOption, 
  onHelpTrigger: (id: string) => void,
  isHiddenHelp: boolean
}) => {
  return (
    <div
      onClick={option.onToggle}
      className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group h-12 shadow-sm overflow-hidden ${
        option.isOn
          ? 'border-stone-900 bg-stone-900 text-white shadow-stone-200'
          : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
      }`}
    >
      <div className={`absolute -right-4 -bottom-4 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110 ${option.isOn ? 'text-white' : 'text-stone-900'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16" style={{ transform: 'scaleX(-1) rotate(15deg)' }}>
          <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z"/>
          <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329"/>
        </svg>
      </div>

      <div className="relative z-10 flex items-center gap-1.5 overflow-hidden flex-1">
        {option.hasHelp && !isHiddenHelp && (
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onHelpTrigger(option.key);
            }}
            variant="ghost"
            mode="circle"
            size="sm"
            className={`!shrink-0 !p-0 !w-6 !h-6 shadow-none border-none transition-all ${option.isOn ? '!text-emerald-400' : '!text-stone-300 hover:!text-stone-950'}`}
            icon={<Lucide.HelpCircle size={14} />}
          />
        )}
        <span className="text-[10px] font-black uppercase tracking-tight leading-none truncate">
          {option.label}
        </span>
      </div>

      <div className="relative z-10 shrink-0 ml-2 pointer-events-auto">
        <StatusToggle 
          value={option.isOn} 
          onChange={option.onToggle}
          variant="compact"
          activeColor="!bg-emerald-500 !text-white border-none"
        />
      </div>
    </div>
  );
}

export default function DisplaySettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  isInlineEnabled,
  onToggleInline,
  isStatic = false,
}: DisplaySettingsModalProps) {
    const { showFeedback, adminPin } = useStore();
    const [isUploading, setIsUploading] = useState(false);
    const [helpId, setHelpId] = useState<string | null>(null);
    const [hiddenHelpIds, setHiddenHelpIds] = useState<string[]>(() => {
      return storage.get('ekatalog_hidden_help_ids', []);
    });

    const [localConfig, setLocalConfig] = useState(settings?.displayConfig || {});
    const [localAnnouncement, setLocalAnnouncement] = useState(settings?.announcementBar?.enabled || false);
    const [localMaintenance, setLocalMaintenance] = useState(settings?.maintenanceMode?.enabled || false);
    const [localInline, setLocalInline] = useState(isInlineEnabled);

    useEffect(() => {
      if (!isOpen) return;
      setLocalConfig(settings?.displayConfig || {});
      setLocalAnnouncement(settings?.announcementBar?.enabled || false);
      setLocalMaintenance(settings?.maintenanceMode?.enabled || false);
      setLocalInline(isInlineEnabled);
    }, [settings, isInlineEnabled, isOpen]);

    if (!settings) return null;

    const getOptionState = (key: keyof DisplayConfig) => {
      const val = localConfig[key];
      if (key === 'showPrice') return val !== false;
      if (key === 'showWhatsapp') return val !== false;
      if (key === 'showCarousel') return val !== false;
      return !!val;
    };

    const toggleOption = async (key: keyof DisplayConfig) => {
      const currentVal = getOptionState(key);
      const newVal = !currentVal;
      setLocalConfig(prev => ({ ...prev, [key]: newVal }));
      try {
        await updateSetting('displayConfig', {
          ...settings.displayConfig,
          [key]: newVal,
        });
      } catch (err) {
        setLocalConfig(settings.displayConfig || {});
      }
    };

    const toggleAnnouncement = async () => {
      const newVal = !localAnnouncement;
      setLocalAnnouncement(newVal);
      try {
        await updateSetting('announcementBar', { ...settings.announcementBar, enabled: newVal });
      } catch (err) {
        setLocalAnnouncement(settings.announcementBar?.enabled || false);
      }
    };

    const toggleMaintenance = async () => {
      const newVal = !localMaintenance;
      setLocalMaintenance(newVal);
      try {
        await updateSetting('maintenanceMode', { ...settings.maintenanceMode, enabled: newVal });
      } catch (err) {
        setLocalMaintenance(settings.maintenanceMode?.enabled || false);
      }
    };

    const handleToggleInline = () => {
      setLocalInline(!localInline);
      onToggleInline();
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !adminPin) return;
      setIsUploading(true);
      try {
        const { secureUploadVisualAsset } = await import('../../utils/image');
        const finalizedUrl = await secureUploadVisualAsset({
          file,
          folder: 'logos',
          adminPin,
          oldUrl: settings.logoUrl,
          slugBaseName: settings.name,
          uniqueIdPrefix: 'logo',
          isDualQuality: false
        });
        
        await updateSetting('logoUrl', finalizedUrl);
        showFeedback('success', 'Logo başarıyla güncellendi');
      } catch (err) {
        showFeedback('error', 'Logo yüklenirken bir hata oluştu');
      } finally {
        setIsUploading(false);
      }
    };

    const hideHelpPermanently = (id: string) => {
      const updated = [...hiddenHelpIds, id];
      setHiddenHelpIds(updated);
      storage.set('ekatalog_hidden_help_ids', updated);
      setHelpId(null);
    };

    const allOptions = [
      { key: 'showPrice', label: 'Ürün Fiyatları', isOn: getOptionState('showPrice'), onToggle: () => toggleOption('showPrice') },
      { key: 'showWhatsapp', label: 'WhatsApp', isOn: getOptionState('showWhatsapp'), onToggle: () => toggleOption('showWhatsapp') },
      { key: 'showInstagram', label: 'Instagram', isOn: getOptionState('showInstagram'), onToggle: () => toggleOption('showInstagram') },
      { key: 'showAddress', label: 'Adres Bilgisi', isOn: getOptionState('showAddress'), onToggle: () => toggleOption('showAddress') },
      { key: 'showLogo', label: 'Logo Görünümü', isOn: getOptionState('showLogo'), onToggle: () => toggleOption('showLogo') },
      { key: 'showSubtitle', label: 'Slogan Görünümü', isOn: getOptionState('showSubtitle'), onToggle: () => toggleOption('showSubtitle') },
      { key: 'showCarousel', label: 'Afişler', isOn: getOptionState('showCarousel'), onToggle: () => toggleOption('showCarousel') },
      { key: 'showReferences', label: 'Referanslar', isOn: getOptionState('showReferences'), onToggle: () => toggleOption('showReferences') },
      { key: 'announcement', label: 'Duyuru Panosu', isOn: localAnnouncement, onToggle: toggleAnnouncement },
      { key: 'showCoupons', label: 'Kupon İndirimi', isOn: getOptionState('showCoupons'), onToggle: () => toggleOption('showCoupons') },
      { key: 'showCurrency', label: 'Döviz Çevirici', isOn: getOptionState('showCurrency'), onToggle: () => toggleOption('showCurrency') },
      { key: 'showPriceList', label: 'Fiyat Listesi', isOn: getOptionState('showPriceList'), onToggle: () => toggleOption('showPriceList') },
      { key: 'inline', label: 'Hızlı Düzenleme', isOn: localInline, onToggle: handleToggleInline, hasHelp: false },
      { key: 'maintenance', label: 'Bakım Modu', isOn: localMaintenance, onToggle: toggleMaintenance, hasHelp: true },
    ];

    const activeOptions = allOptions.filter(o => o.isOn);
    const inactiveOptions = allOptions.filter(o => !o.isOn);

    return (
      <>
        <BaseModal
          isOpen={isOpen}
          onClose={onClose}
          maxWidth="max-w-lg"
          isStatic={isStatic}
          noPadding={true}
          footer={
            <div className="flex gap-3 w-full">
              <Button onClick={onClose} variant="secondary" mode="rectangle" className={`w-16 h-16 !bg-stone-50 border-stone-100 shrink-0 ${THEME.shadows.sm}`}>
                <Lucide.ChevronLeft size={24} strokeWidth={4} />
              </Button>
              <Button onClick={onClose} variant="action" size="md" className="flex-1 h-16 !rounded-[24px]">
                <Lucide.Check size={28} strokeWidth={4} />
              </Button>
            </div>
          }
        >
          <div className="p-4 flex flex-col gap-4 pb-2">
            <div className="bg-stone-50 rounded-[2rem] border border-stone-100 p-6 flex flex-col items-center gap-4 relative overflow-hidden">
              <div className="relative w-20 h-20 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Lucide.Image className="text-stone-200" size={32} />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="relative cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all shadow-sm">
                  <Lucide.Camera size={14} />
                  LOGO DEĞİŞTİR
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              <div className="col-span-2 px-1 flex items-baseline gap-2 mt-1 mb-1 pl-4 border-l-2 border-stone-900">
                <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">AÇIK</h5>
              </div>
              {activeOptions.map((option) => (
                <SettingCard key={option.key} option={option} onHelpTrigger={setHelpId} isHiddenHelp={hiddenHelpIds.includes(option.key)} />
              ))}
              <div className="col-span-2 px-1 flex items-baseline gap-2 mt-6 mb-1 pl-4 border-l-2 border-stone-900">
                <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">KAPALI</h5>
              </div>
              {inactiveOptions.map((option) => (
                <div key={option.key} className="opacity-50 transition-opacity">
                  <SettingCard key={option.key} option={option} onHelpTrigger={setHelpId} isHiddenHelp={hiddenHelpIds.includes(option.key)} />
                </div>
              ))}
            </div>
          </div>
        </BaseModal>

        <BaseModal isOpen={!!helpId} onClose={() => setHelpId(null)} maxWidth="max-w-sm" isStatic={isStatic} footer={
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={() => setHelpId(null)} variant="primary" size="md" className="w-full !py-4 font-black" mode="rectangle">KAPAT</Button>
            <Button onClick={() => helpId && hideHelpPermanently(helpId)} variant="ghost" size="sm" className="w-full !text-stone-400 !text-[9px] font-black hover:!text-stone-900 underline px-6 text-center leading-tight shadow-none" mode="rectangle">Bu ipucunu tekrar gösterme</Button>
          </div>
        }>
          {helpId && (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"><Lucide.ShieldCheck size={18} /></div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-bold">{HELP_CONTENTS[helpId].onText}</p>
              </div>
              <div className="bg-stone-50 border border-stone-100 p-5 rounded-3xl opacity-60 text-stone-500 flex items-center gap-4">
                <div className="w-8 h-8 bg-stone-200 rounded-xl flex items-center justify-center shrink-0 text-stone-400">
                  <Lucide.X size={18} strokeWidth={3} />
                </div>
                <p className="text-[11px] leading-relaxed font-bold">{HELP_CONTENTS[helpId].offText}</p>
              </div>
            </div>
          )}
        </BaseModal>
      </>
    );
}
