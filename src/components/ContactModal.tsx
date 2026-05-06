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
      maxWidth="max-w-xs"
      noPadding
    >
      <div className="flex flex-col bg-stone-50 border-b border-stone-100 rounded-[2.5rem] shadow-sm overflow-hidden p-10">
        {/* Main Action Group: Phone & WhatsApp Side-by-Side */}
        <div className="flex items-center justify-center gap-8 w-full">
          {/* Phone Button */}
          <Button
            onClick={handlePhoneCall}
            variant="phone"
            mode="circle"
            className="!w-20 !h-20 shadow-2xl transition-all active:scale-90"
            showFingerprint={false}
            icon={<Lucide.Phone size={32} strokeWidth={2.5} />}
          />

          {/* WhatsApp Button */}
          <Button
            onClick={handleWhatsApp}
            variant="whatsapp"
            mode="circle"
            className="!w-20 !h-20 shadow-2xl transition-all active:scale-90 border-none"
            showFingerprint={false}
            icon={<div className="w-10 h-10 fill-white">{THEME.icons.whatsapp}</div>}
          />
        </div>
      </div>
    </BaseModal>
  );
}
