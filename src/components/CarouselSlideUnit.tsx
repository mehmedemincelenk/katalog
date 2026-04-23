import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../data/config';
import SmartImage from './SmartImage';
import OrderSelector from './OrderSelector';
import Button from './Button';

import { CarouselSlideUnitProps } from '../types';
import { resolveVisualAssetUrl } from '../utils/image';

/**
 * CAROUSEL SLIDE UNIT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * An autonomous cinematic slide unit that manages its own visual
 * state (Active vs Ghost) to ensure layout purity.
 */
const CarouselSlideUnit = memo(
  ({
    slideData,
    isCurrentlyActive,
    isAdmin,
    isCurrentlyUploading,
    editingTargetSlideId,
    onImageUpdateTrigger,
    onDeleteTrigger,
    onAddTrigger,
    onReorderTrigger,
    currentIndex,
    totalSlides,
  }: CarouselSlideUnitProps) => {
    const carouselTheme = THEME.heroCarousel;
    const globalIcons = THEME.icons;

    const onAction = () => {
      if (isAdmin && !isCurrentlyUploading) {
        onImageUpdateTrigger(slideData.id);
      }
    };

    return (
      <motion.div
        initial={false}
        animate={{
          opacity: isCurrentlyActive ? 1 : 0.35,
          scale: isCurrentlyActive ? 1 : 0.95,
          filter: isCurrentlyActive ? 'blur(0px)' : 'blur(2px)',
          zIndex: isCurrentlyActive ? 10 : 0,
        }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`
        ${carouselTheme.slide.base} 
        rounded-lg overflow-hidden relative w-full h-full
        ${isCurrentlyActive ? 'pointer-events-auto' : 'pointer-events-none'} 
        ${slideData.bg}
      `}
      >
        <div
          className={`relative w-full h-full overflow-hidden ${isAdmin ? 'cursor-pointer' : ''}`}
          onClick={onAction}
        >
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

        {/* ADMIN CONTROLS ON SLIDE: Specialized interaction layer */}
        <AnimatePresence>
          {isAdmin && isCurrentlyActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(12px)', scale: 0.9 }}
              className="absolute bottom-6 right-6 z-[50] flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()} // SAFE ZONE: Clicking between buttons won't trigger image change
            >
              <OrderSelector
                currentOrder={currentIndex}
                totalCount={totalSlides}
                onChange={(newIdx) => onReorderTrigger?.(slideData.id, newIdx)}
              />

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddTrigger?.();
                }}
                variant="glass"
                mode="square"
                size="xs"
                icon={globalIcons.plus}
                title="Yeni Slide Ekle"
              />
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteTrigger?.(slideData.id);
                }}
                variant="danger"
                mode="square"
                size="sm"
                icon={globalIcons.trash}
                title="AFİŞİ SİL"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPLOAD PROGRESS VISUAL */}
        {isCurrentlyUploading &&
          editingTargetSlideId === slideData.id &&
          isCurrentlyActive && (
            <div className={carouselTheme.slide.overlay}>
              <div className={carouselTheme.slide.loadingSpinner}></div>
            </div>
          )}
      </motion.div>
    );
  },
);

export default CarouselSlideUnit;
