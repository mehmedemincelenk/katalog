import BaseModal from './BaseModal';
import Button from './Button';
import { Package, Layers, Users, Image as ImageIcon } from 'lucide-react';

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
}: GlobalAddMenuModalProps) {
  const options: {
    id: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL';
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'PRODUCT',
      title: 'YENİ ÜRÜN',
      subtitle: 'Kataloğa yeni bir ürün ekleyin',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-stone-900 text-white',
    },
    {
      id: 'CATEGORY',
      title: 'YENİ REYON',
      subtitle: 'Ürünlerinizi gruplayın',
      icon: <Layers className="w-6 h-6" />,
      color: 'bg-amber-500 text-white',
    },
    {
      id: 'REFERENCE',
      title: 'YENİ REFERANS',
      subtitle: 'İş ortağı veya referans ekleyin',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-emerald-500 text-white',
    },
    {
      id: 'CAROUSEL',
      title: 'YENİ AFİŞ',
      subtitle: 'Vitrini güncelleyin',
      icon: <ImageIcon className="w-6 h-6" />,
      color: 'bg-blue-600 text-white',
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title="NE EKLEMEK İSTERSİNİZ?"
    >
      <div className="grid grid-cols-1 gap-3 py-2">
        {options.map((option) => (
          <Button
            key={option.id}
            onClick={() => {
              onAction(option.id);
              onClose();
            }}
            variant="ghost"
            mode="rectangle"
            className="group !flex !items-center !gap-5 !p-5 !rounded-[2rem] border border-stone-100 !bg-white hover:!border-stone-900 hover:!shadow-xl hover:!shadow-stone-200 transition-all !text-left !h-auto shadow-none"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${option.color} group-hover:scale-110 transition-transform`}
            >
              {option.icon}
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                {option.title}
              </h4>
              <p className="text-[11px] font-bold text-stone-400 mt-1">
                {option.subtitle}
              </p>
            </div>
          </Button>
        ))}
      </div>
    </BaseModal>
  );
}
