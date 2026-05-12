import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../../data/config';
import SmartImage from '../ui/SmartImage';
import { resolveVisualAssetUrl } from '../../utils/image';
import Button from '../ui/Button';
import * as Lucide from 'lucide-react';

/**
 * CAROUSEL SLIDE UNIT (Admin Optimized)
 * -----------------------------------------------------------
 * Renders a single banner slide with administrative overlays.
 */

import {
  CarouselSlide,
} from '../../types';

const CarouselSlideUnit = memo(
  ({
    slideData,
    currentIndex,
    totalSlides,
    isAdmin,
    isCurrentlyActive,
    isCurrentlyUploading,
    editingTargetSlideId,
    onDeleteTrigger,
    onUpload,
    onOrderChange,
  }: {
    slideData: CarouselSlide;
    currentIndex: number;
    totalSlides: number;
    isAdmin: boolean;
    isCurrentlyActive: boolean;
    isCurrentlyUploading: boolean;
    editingTargetSlideId: number | null;
    onDeleteTrigger: (id: number) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onOrderChange?: (newPos: number) => void;
  }) => {
    const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const carouselTheme = THEME.heroCarousel;
    const globalIcons = THEME.icons;

    return (
      <div className={`${carouselTheme.slide.base} overflow-hidden rounded-none relative`}>
        {/* VISUAL ASSET LAYER */}
        <div className="relative w-full h-full">
          <SmartImage
            src={resolveVisualAssetUrl(slideData.src)}
            alt={slideData.label}
            aspectRatio="rectangle"
            priority={true}
            className={`
            ${carouselTheme.slide.image} 
            ${isCurrentlyUploading && editingTargetSlideId === slideData.id ? carouselTheme.slide.loadingBlur : ''}
          `}
          />
        </div>

        <AnimatePresence>
          {isAdmin && (
            <div className="absolute inset-0 pointer-events-none z-[999]">
              {/* INTERACTIVE SEQUENCE BADGE - TOP LEFT */}
              <div 
                className={`${carouselTheme.slide.changeBadge} !top-4 !left-4 !right-auto !pointer-events-auto flex items-center relative w-fit h-fit transition-opacity duration-500 ${isCurrentlyActive ? 'opacity-100' : 'opacity-40'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={currentIndex}
                  disabled={isUpdatingOrder}
                  onChange={async (e) => {
                    e.stopPropagation();
                    const newPos = Number(e.target.value);
                    setIsUpdatingOrder(true);
                    try {
                      await onOrderChange?.(newPos);
                      setIsUpdatingOrder(false);
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 1500);
                    } finally {
                      setIsUpdatingOrder(false);
                    }
                  }}
                  className={`absolute inset-0 cursor-pointer z-10 ${isUpdatingOrder || showSuccess ? 'opacity-0' : 'opacity-0'}`}
                >
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <option key={i} value={i}>{i + 1}.</option>
                  ))}
                </select>
                {isUpdatingOrder ? (
                  <div className="w-3 h-3 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin mx-2" />
                ) : showSuccess ? (
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center mx-1">
                    <Lucide.Check size={12} className="text-emerald-500" strokeWidth={4} />
                  </motion.div>
                ) : (
                  <span className="text-white text-[11px] font-black">{currentIndex + 1}.</span>
                )}
              </div>

              {/* DELETE BUTTON - TOP RIGHT */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`absolute top-4 right-4 !pointer-events-auto transition-opacity duration-500 ${isCurrentlyActive ? 'opacity-100' : 'opacity-40'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteTrigger?.(slideData.id);
                  }}
                  variant="danger"
                  mode="circle"
                  className="w-8 h-8 shadow-xl border-2 border-white/20"
                  icon={<div className="w-3.5 h-3.5">{globalIcons.trash}</div>}
                  title="AFİŞİ SİL"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FILE INPUT OVERLAY - ADMIN ONLY */}
        {isAdmin && isCurrentlyActive && (
          <div className="absolute inset-0 z-20 cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-30"
              onChange={(e) => {
                onUpload(e);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* LOCAL LOADING SPINNER WITHIN IMAGE BOUNDS */}
            {isCurrentlyUploading && editingTargetSlideId === slideData.id && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/10 backdrop-blur-[2px] transition-all duration-500 z-40">
                <div className={carouselTheme.slide.loadingSpinner} />
                <span className="mt-4 text-[10px] font-black text-white tracking-[0.2em] animate-pulse">LÜTFEN BEKLEYİN...</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

CarouselSlideUnit.displayName = 'CarouselSlideUnit';
export default CarouselSlideUnit;
