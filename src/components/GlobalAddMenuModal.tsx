import BaseModal from './BaseModal';
import Button from './Button';
import { GlobalAddMenuModalProps } from '../types';

/**
 * GLOBAL ADD MENU MODAL (Diamond Standard)
 * -----------------------------------------------------------
 * Specialized quick-action menu for administrative tasks.
 * Uses atomic Button unit for card-like interactions.
 */
export default function GlobalAddMenuModal({
  isOpen,
  onClose,
  onAction,
  isStatic = false,
}: GlobalAddMenuModalProps) {
  const options: {
    id: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL';
    title: string;
  }[] = [
    { id: 'PRODUCT', title: 'ÜRÜN EKLE' },
    { id: 'CATEGORY', title: 'KATEGORİ EKLE' },
    { id: 'REFERENCE', title: 'REFERANS EKLE' },
    { id: 'CAROUSEL', title: 'AFİŞ EKLE' },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      isStatic={isStatic}
      title="İŞLEMLER"
    >
      <div className="grid grid-cols-1 gap-2 py-2">
        {options.map((option) => (
          <Button
            key={option.id}
            onClick={() => {
              onAction(option.id);
              onClose();
            }}
            variant="primary"
            mode="rectangle"
            showFingerprint={true}
            className="!h-16 !rounded-2xl !bg-stone-50 !text-stone-900 border-none hover:!bg-stone-900 hover:!text-white transition-all shadow-none"
          >
            <span className="text-xs font-black uppercase tracking-widest">
              {option.title}
            </span>
          </Button>
        ))}
      </div>
    </BaseModal>
  );
}
