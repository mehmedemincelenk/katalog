import { memo, useState } from 'react';
import Button from './Button';
import BaseModal from './BaseModal';
import { HelpCircle, Sparkles, Settings2, ShieldCheck } from 'lucide-react';
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
 * Memoized to prevent entire modal re-renders during toggle actions.
 */
const SettingCard = memo(({ 
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
      className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group h-12 shadow-sm ${
        option.isOn
          ? 'border-stone-900 bg-stone-900 text-white shadow-stone-200'
          : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
      }`}
    >
      <div className="flex items-center gap-1.5 overflow-hidden flex-1">
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
            icon={<HelpCircle size={14} />}
          />
        )}
        <span className="text-[10px] font-black uppercase tracking-tight leading-none truncate">
          {option.label}
        </span>
      </div>

      <div
        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${
          option.isOn
            ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
            : 'bg-stone-200'
        }`}
      />
    </div>
  );
});

/**
 * DISPLAY SETTINGS MODAL (DIAMOND EDITION)
 * -----------------------------------------------------------
 * The cockpit of the store. Managed with strict key-based lifecycle.
 */
const DisplaySettingsModal = memo(
  ({
    isOpen,
    onClose,
    settings,
    updateSetting,
    isInlineEnabled,
    onToggleInline,
  }: DisplaySettingsModalProps) => {
    const [helpId, setHelpId] = useState<string | null>(null);
    const [isIntroOpen, setIsIntroOpen] = useState(() => {
      if (typeof window === 'undefined') return false;
      const skipIntro = localStorage.getItem('ekatalog_skip_settings_intro') === 'true';
      return !skipIntro;
    });
    const [hiddenHelpIds, setHiddenHelpIds] = useState<string[]>(() => {
      if (typeof window === 'undefined') return [];
      const hidden = localStorage.getItem('ekatalog_hidden_help_ids');
      return hidden ? JSON.parse(hidden) : [];
    });

    if (!settings) return null;
    const config = settings.displayConfig;

    const toggleOption = (key: string) => {
      updateSetting('displayConfig', {
        ...config,
        [key]: !config[key as keyof DisplayConfig],
      });
    };

    const toggleAnnouncement = () => {
      updateSetting('announcementBar', {
        ...settings.announcementBar,
        enabled: !settings.announcementBar?.enabled,
      });
    };

    const toggleMaintenance = () => {
      updateSetting('maintenanceMode', {
        ...settings.maintenanceMode,
        enabled: !settings.maintenanceMode?.enabled,
      });
    };

    const skipIntroPermanently = () => {
      localStorage.setItem('ekatalog_skip_settings_intro', 'true');
      setIsIntroOpen(false);
    };

    const hideHelpPermanently = (id: string) => {
      const updated = [...hiddenHelpIds, id];
      setHiddenHelpIds(updated);
      localStorage.setItem('ekatalog_hidden_help_ids', JSON.stringify(updated));
      setHelpId(null);
    };

    const groups = [
      {
        title: 'GÖRÜNÜRLÜK',
        subtitle: 'Bölümleri Aç / Kapat',
        options: [
          { key: 'showPrice', label: 'Ürün Fiyatları', isOn: config.showPrice, onToggle: () => toggleOption('showPrice') },
          { key: 'showWhatsapp', label: 'WhatsApp', isOn: config.showWhatsapp, onToggle: () => toggleOption('showWhatsapp') },
          { key: 'showInstagram', label: 'Instagram', isOn: config.showInstagram, onToggle: () => toggleOption('showInstagram') },
          { key: 'showCarousel', label: 'Afişler', isOn: config.showCarousel, onToggle: () => toggleOption('showCarousel') },
          { key: 'showReferences', label: 'Referanslar', isOn: config.showReferences, onToggle: () => toggleOption('showReferences') },
          { key: 'announcement', label: 'Duyuru Panosu', isOn: settings.announcementBar?.enabled ?? false, onToggle: toggleAnnouncement },
        ],
      },
      {
        title: 'FONKSİYONLAR',
        subtitle: 'Ziyaretçi Yetkileri',
        options: [
          { key: 'showCoupons', label: 'Kupon İndirimi', isOn: config.showCoupons, onToggle: () => toggleOption('showCoupons') },
          { key: 'showCurrency', label: 'Döviz Çevirici', isOn: config.showCurrency, onToggle: () => toggleOption('showCurrency') },
          { key: 'showPriceList', label: 'Fiyat Listesi', isOn: config.showPriceList, onToggle: () => toggleOption('showPriceList') },
        ],
      },
      {
        title: 'YÖNETİM',
        subtitle: 'Dükkan Kontrolleri',
        options: [
          { key: 'inline', label: 'Hızlı Düzenleme', isOn: isInlineEnabled, onToggle: onToggleInline, hasHelp: true },
          { key: 'maintenance', label: 'Bakım Modu', isOn: settings.maintenanceMode?.enabled ?? false, onToggle: toggleMaintenance, hasHelp: true },
        ],
      },
    ];

    return (
      <>
        <BaseModal
          isOpen={isOpen && !isIntroOpen}
          onClose={onClose}
          maxWidth="max-w-md"
          title="Mağaza Özellikleri"
          subtitle="Dükkanınızı isteğinize göre yapılandırın"
          footer={
            <Button onClick={onClose} variant="primary" size="md" mode="rectangle" className="w-full !rounded-2xl !py-4 font-black">
              AYARLARI KAYDET VE KAPAT
            </Button>
          }
        >
          <div className="space-y-6 pb-2 -mt-2">
            {groups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="px-1 flex items-baseline gap-2 mb-1 pl-4 border-l-2 border-stone-900">
                  <h5 className="text-[9px] font-black text-stone-900 uppercase tracking-[0.2em]">{group.title}</h5>
                  <span className="text-[10px] text-stone-300 font-bold italic truncate opacity-70">— {group.subtitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((option) => (
                    <SettingCard 
                      key={option.key} 
                      option={option} 
                      onHelpTrigger={setHelpId}
                      isHiddenHelp={hiddenHelpIds.includes(option.key)}
                    />
                  ))}
                </div>
              </div>
            ))}

          </div>
        </BaseModal>

        {/* INTRO ONBOARDING MODAL */}
        <BaseModal isOpen={isOpen && isIntroOpen} onClose={() => setIsIntroOpen(false)} maxWidth="max-w-sm" title="DÜKKAN KUMANDA MERKEZİ">
          <div className="flex flex-col items-center text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-stone-900 rounded-[28px] flex items-center justify-center text-white shadow-2xl rotate-3"><Settings2 size={32} /></div>
            <div className="space-y-2">
              <h4 className="text-sm font-black text-stone-900 uppercase tracking-widest">Burada Neler Yapabilirsiniz?</h4>
              <p className="text-[11px] text-stone-400 font-bold leading-relaxed px-4">
                Bu panel, dükkanınızın tüm görünümünü ve fonksiyonlarını anlık olarak yönettiğiniz yerdir. 
                <br /><br />
                <span className="text-stone-900">İstediğiniz özelliği tek tıkla açabilir, ürün fiyatlarını gizleyebilir veya dükkanınızı bakım moduna alabilirsiniz.</span>
              </p>
            </div>
            <div className="w-full bg-stone-50 p-4 rounded-3xl border border-stone-100 flex items-start gap-4 text-left">
              <div className="w-8 h-8 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0"><Sparkles size={16} className="text-amber-500" /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-stone-900 tracking-tighter">İpucu</span>
                <p className="text-[10px] font-bold text-stone-400 leading-tight mt-1">Değişiklikler anında sunucularımıza kaydedilir ve tüm dünyada yayınlanır.</p>
              </div>
            </div>
            <div className="w-full space-y-2 pt-2">
              <Button onClick={() => setIsIntroOpen(false)} variant="primary" size="md" mode="rectangle" className="w-full !rounded-2xl !py-4 font-black uppercase tracking-widest">TAMAM, ANLADIM</Button>
              <Button onClick={skipIntroPermanently} variant="ghost" mode="rectangle" className="w-full !text-[10px] font-black !text-stone-300 hover:!text-stone-900 uppercase tracking-[0.15em] shadow-none">BUNU TEKRAR GÖSTERME</Button>
            </div>
          </div>
        </BaseModal>

        {/* REUSABLE HELP MODAL */}
        <BaseModal
          isOpen={!!helpId}
          onClose={() => setHelpId(null)}
          maxWidth="max-w-sm"
          title={helpId ? HELP_CONTENTS[helpId]?.title : ''}
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
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"><ShieldCheck size={18} /></div>
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
  },
);

export default DisplaySettingsModal;
