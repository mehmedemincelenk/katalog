import { useState, useEffect } from 'react';
import { THEME, LABELS } from '../data/config';
import Button from './Button';
import BaseModal from './BaseModal';
import { ArrowLeft, Gift } from 'lucide-react';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (code: string) => void;
  discountError?: string | null;
  activeDiscount?: { rate: number; category?: string } | null;
}

export default function CouponModal({ isOpen, onClose, onApplyDiscount, discountError, activeDiscount }: CouponModalProps) {
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCouponCode('');
    }
  }, [isOpen]);

  const handleApply = () => {
    if (couponCode.trim()) {
      onApplyDiscount(couponCode.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApply();
  };

  const footer = (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Button 
        onClick={onClose}
        variant="ghost"
        size="md"
        mode="rectangle"
        className="w-full !rounded-[var(--radius-card)] !py-4"
        icon={<ArrowLeft size={16}/>}
      >
        GERİ
      </Button>
      <Button 
        onClick={handleApply}
        variant="primary"
        size="md"
        mode="rectangle"
        className="w-full !rounded-[var(--radius-card)] !py-4 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200/50"
      >
        KABUL ET
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      icon={<Gift className="text-green-600" size={24} />}
      title="İndirim Kuponu"
      subtitle="Avantajlı fiyatlar için kodunuzu girin"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="relative">
          <input 
            type="text" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder=" "
            className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-5 py-4 text-center font-black text-stone-900 tracking-[0.2em] uppercase focus:border-green-600 focus:bg-white transition-all outline-none placeholder:text-stone-300 placeholder:tracking-normal"
          />
        </div>

        {activeDiscount && (
          <div className="bg-emerald-50 text-emerald-600 rounded-xl px-4 py-3 text-center border border-emerald-100/50 flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Aktif İndirim</span>
            <span className="text-sm font-bold">%{activeDiscount.rate * 100} Onaylandı ✓</span>
          </div>
        )}

        {discountError && (
          <div className="bg-red-50 text-red-500 rounded-xl px-4 py-3 text-center border border-red-100/50 flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Hata</span>
            <span className="text-xs font-bold font-sans">Geçersiz Kupon Kodu</span>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
