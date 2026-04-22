/**
 * AI STUDIO COMPARE MODAL (STUDIO LAB)
 * -----------------------------------------
 * Professional A/B selection interface for AI-enhanced visuals.
 * Allows catalog owners to see the "Diamond Studio" difference before applying.
 */

import { motion } from 'framer-motion';
import { Product } from '../types';
import { THEME, LABELS } from '../data/config';
import BaseModal from './BaseModal';
import Button from './Button';
import { resolveVisualAssetUrl } from '../utils/image';

interface AIStudioCompareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (productId: string, polishedUrl: string) => void;
  onDismiss: (productId: string) => void;
}

const AIStudioCompareModal = ({
  product,
  isOpen,
  onClose,
  onApply,
  onDismiss
}: AIStudioCompareModalProps) => {
  if (!product || !product.polishedImage) return null;

  const v = Date.now();
  const originalUrl = `${resolveVisualAssetUrl(product.originalImage || product.image)}?v=${v}`;
  const polishedUrl = `${resolveVisualAssetUrl(product.polishedImage)}?v=${v}`;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Diamonds Studio İncelemesi"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-8 py-4">
        {/* EXPLANATION */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
          <div className="w-6 h-6 text-blue-600 mt-0.5 shrink-0">
            {THEME.icons.diamond}
          </div>
          <div>
            <h4 className="text-blue-900 font-bold text-sm">Görseliniz Parlatıldı!</h4>
            <p className="text-blue-700/80 text-[11px] sm:text-xs leading-relaxed font-medium">
              Yapay zeka, ürününüzün arkaplanını temizledi, profesyonel stüdyo ışığı ekledi ve tam merkeze hizaladı. 
              Kataloğunuzda daha elit bir görünüm için yeni görseli kullanmanızı öneririz.
            </p>
          </div>
        </div>

        {/* COMPARISON GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ORIGINAL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Orijinal Fotoğraf</span>
            </div>
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
              <img src={originalUrl!} alt="Original" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* POLISHED */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1.5">
                <span className="w-3 h-3">{THEME.icons.diamond}</span>
                Diamonds Studio Kalitesi
              </span>
            </div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-blue-200 shadow-2xl shadow-blue-500/10">
              <img src={polishedUrl!} alt="Polished" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button 
            onClick={() => onDismiss(product.id)}
            className="text-stone-400 hover:text-stone-600 text-xs font-bold px-4 py-2 transition-colors order-2 sm:order-1"
          >
            Kalsın, Benimki Daha İyi
          </button>
          
          <Button 
            variant="primary" 
            className="w-full sm:w-auto bg-stone-900 !rounded-full px-8 order-1 sm:order-2 flex items-center justify-center gap-2"
            onClick={() => onApply(product.id, product.polishedImage!)}
          >
            <span className="w-4 h-4">{THEME.icons.diamond}</span>
            Yeni Görseli Kullan
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default AIStudioCompareModal;
