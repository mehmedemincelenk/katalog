import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import BaseModal from './BaseModal';
import { ArrowLeft, Gift } from 'lucide-react';
import { CouponModalProps } from '../types';

/**
 * COUPON MODAL (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Handles discount code entry with smooth cinematic feedback.
 * State reset is handled by the 'key' prop pattern in AppModals.
 */
export default function CouponModal({
  isOpen,
  onClose,
  onApplyDiscount,
  discountError,
  activeDiscount,
}: CouponModalProps) {
  const [couponCode, setCouponCode] = useState('');

  const handleApply = useCallback(() => {
    if (couponCode.trim()) {
      onApplyDiscount(couponCode.trim().toUpperCase());
    }
  }, [couponCode, onApplyDiscount]);

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
        className="w-full !rounded-2xl !py-4"
        icon={<ArrowLeft size={16} />}
      >
        GERİ
      </Button>
      <Button
        onClick={handleApply}
        variant="primary"
        size="md"
        mode="rectangle"
        className="w-full !rounded-2xl !py-4 !bg-emerald-600 hover:!bg-emerald-700 shadow-xl shadow-emerald-100"
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
      icon={<Gift className="text-emerald-600" size={24} />}
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
            placeholder="KODU BURAYA YAZIN"
            className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-5 py-5 text-center font-black text-stone-900 tracking-[0.25em] uppercase focus:border-emerald-500 focus:bg-white transition-all outline-none placeholder:text-stone-300 placeholder:tracking-normal placeholder:text-[10px]"
            autoFocus
          />
        </div>

        <AnimatePresence mode="wait">
          {activeDiscount && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-emerald-50 text-emerald-600 rounded-xl px-4 py-3 text-center border border-emerald-100 flex flex-col items-center gap-1 shadow-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Aktif İndirim
              </span>
              <span className="text-sm font-bold">
                %{Math.round(activeDiscount.rate * 100)} İNDİRİM UYGULANDI ✓
              </span>
            </motion.div>
          )}

          {discountError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-red-50 text-red-500 rounded-xl px-4 py-3 text-center border border-red-100 flex flex-col items-center gap-1 shadow-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Geçersiz Kod
              </span>
              <span className="text-xs font-bold">LÜTFEN TEKRAR DENEYİN</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseModal>
  );
}
