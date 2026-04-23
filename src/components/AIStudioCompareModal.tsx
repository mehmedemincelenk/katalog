/**
 * AI STUDIO COMPARE MODAL (STUDIO LAB)
 * -----------------------------------------
 * Professional A/B selection interface for enhanced visuals.
 * Allows catalog owners to see the "Diamond Standard" difference before applying.
 */

import BaseModal from './BaseModal';
import Button from './Button';
import { resolveVisualAssetUrl } from '../utils/image';
import { Sparkles } from 'lucide-react';

import { AIStudioCompareModalProps } from '../types';

import { useState } from 'react';

const AIStudioCompareModal = ({
  product,
  isOpen,
  onClose,
  onApply,
  onDismiss,
}: AIStudioCompareModalProps) => {
  const [v] = useState(() => Date.now());

  if (!product || !product.polished_image_url) return null;

  const originalUrl = `${resolveVisualAssetUrl(product.original_image_url || product.image_url)}?v=${v}`;
  const polishedUrl = `${resolveVisualAssetUrl(product.polished_image_url)}?v=${v}`;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="GÖRÜNÜM TAVSİYESİ"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-5 py-4">
        {/* EXPLANATION */}
        <div className="bg-stone-50 border border-stone-100 p-5 rounded-2xl">
          <p className="text-stone-500 text-xs sm:text-sm leading-relaxed font-medium">
            Ürününüzün arkaplanı temizlendi, profesyonel bir ışık derinliği
            eklendi ve tam merkeze hizalandı. Daha elit bir duruş için bu yeni
            görünümü kullanmanızı öneririz.
          </p>
        </div>

        {/* COMPARISON GRID */}
        <div className="grid grid-cols-2 gap-4 sm:gap-10">
          {/* ORIGINAL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                MEVCUT DURUM
              </span>
            </div>
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-100 transition-all">
              <img
                src={originalUrl!}
                alt="Original"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* POLISHED */}
          <div className="space-y-3 relative">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                YENİ TAVSİYE
              </span>
            </div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl shadow-amber-500/10">
              <img
                src={polishedUrl!}
                alt="Polished"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS - USING CORE COMPONENTS */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            onClick={() => onDismiss(product.id)}
            variant="secondary"
            mode="rectangle"
            className="flex-1 h-[48px] !py-0 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center"
          >
            ESKİSİ KALSIN
          </Button>

          <Button
            onClick={() => onApply(product.id, product.polished_image_url!)}
            variant="primary"
            mode="rectangle"
            className="flex-[1.5] h-[48px] !py-0 bg-stone-900 flex items-center justify-center gap-2 group shadow-2xl whitespace-nowrap"
          >
            <Sparkles
              size={16}
              className="text-amber-400 group-hover:rotate-12 transition-transform"
            />
            <span className="font-black uppercase tracking-tight">
              UYGULAYALIM
            </span>
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default AIStudioCompareModal;
