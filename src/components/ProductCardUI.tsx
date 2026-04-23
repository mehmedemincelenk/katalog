import { memo, useMemo } from 'react';
import { THEME } from '../data/config';
import {
  formatNumberToCurrency,
  transformCurrencyStringToNumber,
} from '../utils/price';
import SmartImage from './SmartImage';

import { ProductCardUIProps } from '../types';

/**
 * PRODUCT CARD UI CORE (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Pure presentation component to ensure 100% visual consistency
 * between the grid, modals, and previews. Wrapped in memo for
 * maximum grid performance.
 */
export const ProductCardUI = memo(
  ({
    product,
    nameOverride,
    descriptionOverride,
    isDimmed = false,
    isHighlighted = false,
    displayCurrency = 'TRY',
    exchangeRates,
    className = '',
    labelOverride,
  }: ProductCardUIProps) => {
    const theme = THEME.productCard;
    const displayName = nameOverride || product.name;
    const displayDescription = descriptionOverride || product.description;

    // Performance Seal: Only re-calculate price if product price or currency changes
    const priceLabel = useMemo(
      () =>
        formatNumberToCurrency(
          transformCurrencyStringToNumber(product.price),
          displayCurrency,
          exchangeRates,
        ),
      [product.price, displayCurrency, exchangeRates],
    );

    return (
      <article
        className={`
      ${theme.container} ${THEME.radius.card} h-fit overflow-hidden border-2 transition-all duration-500
      ${isHighlighted ? 'border-amber-400 shadow-2xl shadow-amber-500/10' : 'border-stone-100'}
      ${isDimmed ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}
      ${className}
    `}
      >
        {/* IMAGE SECTION */}
        <div
          className={`${theme.image.wrapper} w-full overflow-hidden ${theme.image.bg} rounded-t-[inherit] rounded-b-none relative`}
          style={{
            aspectRatio: '1/1',
            flexShrink: 0,
          }}
        >
          <SmartImage
            src={product.image_url}
            alt={displayName}
            aspectRatio="none"
            className="w-full h-full"
            objectFit={theme.image.fit === 'cover' ? 'cover' : 'contain'}
          />

          {/* OVERLAY BADGES */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            <span
              className={`
            px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border backdrop-blur-sm
            ${isHighlighted ? 'bg-amber-400 text-white border-amber-500' : 'bg-white/90 text-stone-900 border-stone-200'}
          `}
            >
              {labelOverride || (isHighlighted ? 'Tavsiye' : 'Orijinal')}
            </span>
            {product.out_of_stock && (
              <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20">
                Stokta Yok
              </span>
            )}
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className={`${theme.padding} flex flex-col gap-1 pb-4`}>
          <div className="flex flex-col gap-1">
            <h3 className={`${theme.typography.name} truncate`}>
              {displayName}
            </h3>
            <p
              className={`${theme.typography.description} line-clamp-3 leading-relaxed min-h-[3em]`}
            >
              {displayDescription || 'Açıklama bulunmuyor.'}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-50 flex items-center justify-between">
            <span className="text-stone-900 text-sm font-black tracking-tight">
              {priceLabel}
            </span>
            {isHighlighted && (
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </article>
    );
  },
);

export default ProductCardUI;
