import BaseModal from './BaseModal';
import { THEME } from '../data/config';
import Button from './Button';
import * as Lucide from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  storeName: string;
  isStatic?: boolean;
}

export default function ContactModal({ isOpen, onClose, phone, storeName, isStatic = false }: ContactModalProps) {
  const handlePhoneCall = () => {
    if (!phone || isStatic) return;
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = () => {
    if (!phone || isStatic) return;
    const text = encodeURIComponent(`Selam ${storeName}, ürünleriniz hakkında bilgi almak istiyorum.`);
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}?text=${text}`, '_blank');
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isStatic={isStatic}
      maxWidth="max-w-sm"
      title="İLETİŞİME GEÇİN"
      noPadding
    >
      <div className="flex flex-col bg-stone-50 border-b border-stone-100 rounded-[2.5rem] shadow-sm overflow-hidden p-8 gap-8">
        {/* Main Action Group: Phone & WhatsApp Side-by-Side */}
        <div className="flex items-center justify-center gap-6 w-full">
          {/* Phone Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handlePhoneCall}
              variant="phone"
              mode="circle"
              className="!w-20 !h-20 shadow-2xl transition-all active:scale-90"
              showFingerprint={true}
              icon={<Lucide.Phone size={32} strokeWidth={2.5} />}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">HEMEN ARA</span>
          </div>

          {/* WhatsApp Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleWhatsApp}
              variant="whatsapp"
              mode="circle"
              className="!w-20 !h-20 shadow-2xl transition-all active:scale-90 border-none"
              showFingerprint={true}
              icon={<div className="w-10 h-10 fill-white">{THEME.icons.whatsapp}</div>}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">WHATSAPP</span>
          </div>
        </div>

        {/* Footer Action: Dismiss */}
        <div className="w-full pt-4">
          <Button
            onClick={onClose}
            variant="secondary"
            mode="rectangle"
            className="w-full !h-16 !bg-white !text-stone-400 !rounded-3xl hover:!bg-stone-100 transition-colors border border-stone-200/50"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">SONRA ARAYACAĞIM</span>
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
