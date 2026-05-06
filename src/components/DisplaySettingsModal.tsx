import { useState } from 'react';
import Button from './Button';
import BaseModal from './BaseModal';
import StatusToggle from './StatusToggle';
import * as Lucide from 'lucide-react';
import { DisplaySettingsModalProps, DisplayConfig } from '../types';

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

/**
 * HELP CONTENTS (Externalized for clarity)
 */
const HELP_CONTENTS: Record<string, HelpInfo> = {
  inline: {
    title: 'Hızlı Düzenleme Nedir?',
    onText:
      'Dükkanınızdaki ürünlerin isimlerine, fiyatlarına veya açıklamalarına doğrudan tıklayarak anında değiştirebilirsiniz. Her şey tıkır tıkır güncellenir.',
    offText:
      'Ürünlerin üzerine tıklandığında sadece ürün detayı açılır. Yanlışlıkla bir şeyleri değiştirme riskini ortadan kaldırmak için kapalı tutulabilir.',
  },
  maintenance: {
    title: 'Bakım Modu Nedir?',
    onText:
      'Dükkanınız geçici olarak ziyaretçilere kapatılır. Siz ayarlarınızı yaparken kimse ürünlerinizi görüntüleyemez.',
    offText:
      'Dükkanınız herkese açıktır. Müşterileriniz ürünlerinizi inceleyebilir ve sipariş oluşturabilir.',
  },
};

/**
 * SETTING CARD (DIAMOND ATOM)
 */
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
      {/* Fingerprint Seal Background */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110 ${option.isOn ? 'text-white' : 'text-stone-900'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16" style={{ transform: 'scaleX(-1) rotate(15deg)' }}>
          <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z"/>
          <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329"/>
          <path d="M4.759 5.833A3.501 3.501 0 0 1 11.559 7a.5.5 0 0 1-1 0 2.5 2.5 0 0 0-4.857-.833.5.5 0 1 1-.943-.334m.3 1.67a.5.5 0 0 1 .449.546 10.7 10.7 0 0 1-.4 2.031l-1.222 4.072a.5.5 0 1 1-.958-.287L4.15 9.793a9.7 9.7 0 0 0 .363-1.842.5.5 0 0 1 .546-.449Zm6 .647a.5.5 0 0 1 .5.5c0 1.28-.213 2.552-.632 3.762l-1.09 3.145a.5.5 0 0 1-.944-.327l1.089-3.145c.382-1.105.578-2.266.578-3.435a.5.5 0 0 1 .5-.5Z"/>
          <path d="M3.902 4.222a5 5 0 0 1 5.202-2.113.5.5 0 0 1-.208.979 4 4 0 0 0-4.163 1.69.5.5 0 0 1-.831-.556m6.72-.955a.5.5 0 0 1 .705-.052A4.99 4.99 0 0 1 13.059 7v1.5a.5.5 0 1 1-1 0V7a3.99 3.99 0 0 0-1.386-3.028.5.5 0 0 1-.051-.705M3.68 5.842a.5.5 0 0 1 .422.568q-.044.289-.044.59c0 .71-.1 1.417-.298 2.1l-1.14 3.923a.5.5 0 1 1-.96-.279L2.8 8.821A6.5 6.5 0 0 0 3.058 7q0-.375.054-.736a.5.5 0 0 1 .568-.422m8.882 3.66a.5.5 0 0 1 .456.54c-.084 1-.298 1.986-.64 2.934l-.744 2.068a.5.5 0 0 1-.941-.338l.745-2.07a10.5 10.5 0 0 0 .584-2.678.5.5 0 0 1 .54-.456"/>
          <path d="M4.81 1.37A6.5 6.5 0 0 1 14.56 7a.5.5 0 1 1-1 0 5.5 5.5 0 0 0-8.25-4.765.5.5 0 0 1-.5-.865m-.89 1.257a.5.5 0 0 1 .04.706A5.48 5.48 0 0 0 2.56 7a.5.5 0 0 1-1 0c0-1.664.626-3.184 1.655-4.333a.5.5 0 0 1 .706-.04ZM1.915 8.02a.5.5 0 0 1 .346.616l-.779 2.767a.5.5 0 1 1-.962-.27l.778-2.767a.5.5 0 0 1 .617-.346m12.15.481a.5.5 0 0 1 .49.51c-.03 1.499-.161 3.025-.727 4.533l-.07.187a.5.5 0 0 1-.936-.351l.07-.187c.506-1.35.634-2.74.663-4.202a.5.5 0 0 1 .51-.49"/>
        </svg>
      </div>

      <div className="relative z-10 flex items-center gap-1.5 overflow-hidden flex-1">
        {option.hasHelp && !isHiddenHelp && (
          <Button
            onClick={(e) => {
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

/**
 * DISPLAY SETTINGS MODAL (DIAMOND EDITION)
 * -----------------------------------------------------------
 * The cockpit of the store. Managed with strict key-based lifecycle.
 */
export default function DisplaySettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  isInlineEnabled,
  onToggleInline,
  isStatic = false,
  initialStep,
}: DisplaySettingsModalProps) {
    const [helpId, setHelpId] = useState<string | null>(null);
    const isIntroOpen = false;
    const [hiddenHelpIds, setHiddenHelpIds] = useState<string[]>(() => {
      try {
        if (typeof window === 'undefined') return [];
        const hidden = localStorage.getItem('ekatalog_hidden_help_ids');
        return hidden ? JSON.parse(hidden) : [];
      } catch (e) {
        return [];
      }
    });

    const [prevInitialStep, setPrevInitialStep] = useState(initialStep);
    if (initialStep !== prevInitialStep) {
      setPrevInitialStep(initialStep);
      if (initialStep !== undefined) {
        if (initialStep === 1) setHelpId(null);
        else if (initialStep === 2) setHelpId(null);
        else if (initialStep === 3) setHelpId('inline');
        else if (initialStep === 4) setHelpId('maintenance');
      }
    }

    // OPTIMISTIC UI: Local state to handle instant toggles
    const [localConfig, setLocalConfig] = useState(settings?.displayConfig || {});
    const [localAnnouncement, setLocalAnnouncement] = useState(settings?.announcementBar?.enabled || false);
    const [localMaintenance, setLocalMaintenance] = useState(settings?.maintenanceMode?.enabled || false);
    const [localInline, setLocalInline] = useState(isInlineEnabled);

    // Sync local state when props update (server response)
    const [prevSettings, setPrevSettings] = useState(settings);
    const [prevIsInline, setPrevIsInline] = useState(isInlineEnabled);

    if (settings !== prevSettings || isInlineEnabled !== prevIsInline) {
      setPrevSettings(settings);
      setPrevIsInline(isInlineEnabled);
      setLocalConfig(settings?.displayConfig || {});
      setLocalAnnouncement(settings?.announcementBar?.enabled || false);
      setLocalMaintenance(settings?.maintenanceMode?.enabled || false);
      setLocalInline(isInlineEnabled);
    }

    if (!settings) return null;

    const toggleOption = async (key: string) => {
      const newVal = !localConfig[key as keyof DisplayConfig];
      // 1. Optimistic Update
      setLocalConfig(prev => ({ ...prev, [key]: newVal }));
      
      // 2. Server Update
      try {
        await updateSetting('displayConfig', {
          ...settings.displayConfig,
          [key]: newVal,
        });
      } catch (err) {
        // Rollback on error
        setLocalConfig(settings.displayConfig || {});
      }
    };

    const toggleAnnouncement = async () => {
      const newVal = !localAnnouncement;
      setLocalAnnouncement(newVal);
      try {
        await updateSetting('announcementBar', {
          ...settings.announcementBar,
          enabled: newVal,
        });
      } catch (err) {
        setLocalAnnouncement(settings.announcementBar?.enabled || false);
      }
    };

    const toggleMaintenance = async () => {
      const newVal = !localMaintenance;
      setLocalMaintenance(newVal);
      try {
        await updateSetting('maintenanceMode', {
          ...settings.maintenanceMode,
          enabled: newVal,
        });
      } catch (err) {
        setLocalMaintenance(settings.maintenanceMode?.enabled || false);
      }
    };

    const handleToggleInline = () => {
      setLocalInline(!localInline);
      onToggleInline();
    };


    const hideHelpPermanently = (id: string) => {
      const updated = [...hiddenHelpIds, id];
      setHiddenHelpIds(updated);
      localStorage.setItem('ekatalog_hidden_help_ids', JSON.stringify(updated));
      setHelpId(null);
    };

    const allOptions = [
      { key: 'showPrice', label: 'Ürün Fiyatları', isOn: localConfig.showPrice, onToggle: () => toggleOption('showPrice') },
      { key: 'showWhatsapp', label: 'WhatsApp', isOn: localConfig.showWhatsapp, onToggle: () => toggleOption('showWhatsapp') },
      { key: 'showInstagram', label: 'Instagram', isOn: localConfig.showInstagram, onToggle: () => toggleOption('showInstagram') },
      { key: 'showCarousel', label: 'Afişler', isOn: localConfig.showCarousel, onToggle: () => toggleOption('showCarousel') },
      { key: 'showReferences', label: 'Referanslar', isOn: localConfig.showReferences, onToggle: () => toggleOption('showReferences') },
      { key: 'announcement', label: 'Duyuru Panosu', isOn: localAnnouncement, onToggle: toggleAnnouncement },
      { key: 'showCoupons', label: 'Kupon İndirimi', isOn: localConfig.showCoupons, onToggle: () => toggleOption('showCoupons') },
      { key: 'showCurrency', label: 'Döviz Çevirici', isOn: localConfig.showCurrency, onToggle: () => toggleOption('showCurrency') },
      { key: 'showPriceList', label: 'Fiyat Listesi', isOn: localConfig.showPriceList, onToggle: () => toggleOption('showPriceList') },
      { key: 'inline', label: 'Hızlı Düzenleme', isOn: localInline, onToggle: handleToggleInline, hasHelp: false },
      { key: 'maintenance', label: 'Bakım Modu', isOn: localMaintenance, onToggle: toggleMaintenance, hasHelp: true },
    ];

    const activeOptions = allOptions.filter(o => o.isOn);
    const inactiveOptions = allOptions.filter(o => !o.isOn);

    return (
      <>
        <BaseModal
          isOpen={isOpen && !isIntroOpen}
          onClose={onClose}
          maxWidth="max-w-lg"
          isStatic={isStatic}
          noPadding={true}
          footer={
            <div className="flex gap-3 w-full">
              <Button onClick={onClose} variant="secondary" mode="rectangle" className="w-16 h-16 !bg-stone-50 border-stone-100 shrink-0 shadow-sm" showFingerprint={false}>
                <Lucide.ChevronLeft size={24} strokeWidth={4} />
              </Button>
              <Button onClick={onClose} variant="action" size="md" className="flex-1 h-16 !rounded-[24px]" showFingerprint={true}>
                <Lucide.Check size={28} strokeWidth={4} />
              </Button>
            </div>
          }
        >
          <div className="p-4 grid grid-cols-2 gap-x-2 gap-y-2 pb-2">
            {/* ACTIVE SECTION */}
            <div className="col-span-2 px-1 flex items-baseline gap-2 mt-1 mb-1 pl-4 border-l-2 border-stone-900">
              <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">AÇIK</h5>
            </div>
            {activeOptions.map((option) => (
              <SettingCard 
                key={option.key} 
                option={option} 
                onHelpTrigger={setHelpId}
                isHiddenHelp={hiddenHelpIds.includes(option.key)}
              />
            ))}

            {/* INACTIVE SECTION */}
            <div className="col-span-2 px-1 flex items-baseline gap-2 mt-6 mb-1 pl-4 border-l-2 border-stone-900">
              <h5 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">KAPALI</h5>
            </div>
            {inactiveOptions.map((option) => (
              <div key={option.key} className="opacity-50 transition-opacity">
                <SettingCard 
                  option={option} 
                  onHelpTrigger={setHelpId}
                  isHiddenHelp={hiddenHelpIds.includes(option.key)}
                />
              </div>
            ))}
          </div>
        </BaseModal>


        {/* REUSABLE HELP MODAL */}
        <BaseModal
          isOpen={!!helpId}
          onClose={() => setHelpId(null)}
          maxWidth="max-w-sm"
          isStatic={isStatic}
          footer={
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={() => setHelpId(null)} variant="primary" size="md" className="w-full !py-4 font-black" mode="rectangle">KAPAT</Button>
              <Button onClick={() => helpId && hideHelpPermanently(helpId)} variant="ghost" size="sm" className="w-full !text-stone-400 !text-[9px] font-black hover:!text-stone-900 underline px-6 text-center leading-tight shadow-none" mode="rectangle">Bu ipucunu tekrar gösterme</Button>
            </div>
          }
        >
          {helpId && (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"><Lucide.ShieldCheck size={18} /></div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-bold">{HELP_CONTENTS[helpId].onText}</p>
                </div>
              </div>
              <div className="bg-stone-50 border border-stone-100 p-5 rounded-3xl opacity-60 text-stone-500 flex items-center gap-4">
                <div className="w-8 h-8 bg-stone-200 rounded-xl flex items-center justify-center shrink-0 text-stone-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </div>
                <p className="text-[11px] leading-relaxed font-bold">{HELP_CONTENTS[helpId].offText}</p>
              </div>
            </div>
          )}
        </BaseModal>
      </>
    );
}
