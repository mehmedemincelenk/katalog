import React from 'react';
import BaseModal from './BaseModal';
import Button from './Button';
import { Sparkles } from 'lucide-react';
import ProductCardUI from './ProductCardUI';

import { AIStudioTextModalProps } from '../types';

const AIStudioTextModal: React.FC<AIStudioTextModalProps> = ({
  isOpen,
  onClose,
  product,
  suggestedName,
  suggestedDescription,
  onConfirm,
  onDismiss,
  displayCurrency = 'TRY',
  exchangeRates,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="GÖRÜNÜM TAVSİYESİ"
      subtitle="Ürün yazılarınızı sizin için standardize ediyoruz"
      maxWidth="max-w-5xl"
    >
      <div className="flex flex-col items-center">
        {/* COMPARISON - FORCED 2 COLUMNS */}
        <div className="grid grid-cols-2 gap-4 sm:gap-10 w-full items-start mt-6">
          {/* ORIGINAL PREVIEW */}
          <ProductCardUI
            product={product}
            isDimmed={false}
            displayCurrency={displayCurrency}
            exchangeRates={exchangeRates}
            className="w-full scale-90 sm:scale-100 origin-top"
            labelOverride="MEVCUT DURUM"
          />

          {/* POLISHED PREVIEW */}
          <ProductCardUI
            product={product}
            nameOverride={suggestedName}
            descriptionOverride={suggestedDescription}
            isHighlighted={true}
            displayCurrency={displayCurrency}
            exchangeRates={exchangeRates}
            className="w-full scale-90 sm:scale-100 origin-top"
            labelOverride="YENİ TAVSİYE"
          />
        </div>

        {/* DECISION SECTION */}
        <div className="mt-6 w-full max-w-lg flex items-center justify-center gap-4">
          <Button
            onClick={onDismiss}
            variant="secondary"
            size="md"
            mode="rectangle"
            className="flex-1 h-[48px] !py-0 font-black uppercase tracking-tight text-center whitespace-nowrap flex items-center justify-center text-xs"
          >
            ESKİSİ KALSIN
          </Button>

          <Button
            onClick={() => onConfirm(suggestedName, suggestedDescription)}
            variant="primary"
            size="md"
            mode="rectangle"
            className="flex-[1.5] h-[48px] !py-0 group shadow-2xl relative overflow-hidden active:scale-95 transition-all text-center whitespace-nowrap flex items-center justify-center text-xs"
            icon={
              <Sparkles
                size={16}
                className="text-amber-400 group-hover:rotate-12 transition-transform"
              />
            }
          >
            <span className="relative z-10 font-black uppercase tracking-tight">
              UYGULAYALIM
            </span>
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default AIStudioTextModal;
