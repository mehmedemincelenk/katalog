import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { THEME } from '../data/config';
import { useCarousel } from '../hooks/useCarousel';
import CarouselSlideUnit from './CarouselSlideUnit';
import Button from './Button';
import PlusPlaceholder from './PlusPlaceholder';

import { HeroCarouselProps } from '../types';

const INTERVAL_MS = 6000;
const SWIPE_THRESHOLD = 50;

/**
 * HERO CAROUSEL COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Implements a centered 60% hero card flanked by 20% "ghost" previews.
 * Features: Infinite loop, Drag/Swipe support, Resize resilience.
 */
export default function HeroCarousel({ isAdminModeActive }: HeroCarouselProps) {
  const {
    slides,
    uploadHeroImage,
    addSlide,
    deleteSlide,
    reorderSlides,
    loading,
  } = useCarousel(isAdminModeActive);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAssetUploading, setIsAssetUploading] = useState(false);
  const [activeEditingSlideId, setActiveEditingSlideId] = useState<
    number | null
  >(null);
  const [isAddingNewSlide, setIsAddingNewSlide] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const carouselTheme = THEME.heroCarousel;
  const globalIcons = THEME.icons;

  // RESIZE RESILIENCE: Track screen size changes to adapt layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // RATIONAL CLONING: Buffer for seamless wrap-around (Memoized)
  const extendedSlides = useMemo(() => {
    if (slides.length === 0) return [];
    return [slides[slides.length - 1], ...slides, slides[0]];
  }, [slides]);

  const handleNext = useCallback(() => {
    if (slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [slides.length]);

  const handleTransitionEnd = useCallback(() => {
    if (currentIndex >= slides.length + 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(slides.length);
    }
  }, [currentIndex, slides.length]);

  useEffect(() => {
    if (isAdminModeActive || isAssetUploading || slides.length <= 1) return;
    const scrollTimer = setInterval(handleNext, INTERVAL_MS);
    return () => clearInterval(scrollTimer);
  }, [handleNext, isAdminModeActive, isAssetUploading, slides.length]);

  const handleAddSlideTrigger = useCallback(async () => {
    await addSlide();
    setIsAddingNewSlide(true);
    setCurrentIndex(slides.length + 1);
  }, [addSlide, slides.length]);

  // GLOBAL SIGNAL LISTENER: Clean way to trigger slide addition from App.tsx
  useEffect(() => {
    if (!isAdminModeActive) return;
    const handleGlobalTrigger = () => handleAddSlideTrigger();
    window.addEventListener('ekatalog:add-carousel-slide', handleGlobalTrigger);
    return () =>
      window.removeEventListener(
        'ekatalog:add-carousel-slide',
        handleGlobalTrigger,
      );
  }, [isAdminModeActive, handleAddSlideTrigger]);

  // TOUCH/DRIPE LOGIC: Unified swipe handler
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (isAdminModeActive || slides.length <= 1) return;
    if (info.offset.x < -SWIPE_THRESHOLD) handleNext();
    else if (info.offset.x > SWIPE_THRESHOLD) handlePrev();
  };

  const handleFileUploadAction = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !activeEditingSlideId) return;
    try {
      setIsAssetUploading(true);
      await uploadHeroImage(activeEditingSlideId, file);
      if (isAddingNewSlide) setIsAddingNewSlide(false);
    } catch (err) {
      console.error('Image deployment error:', err);
    } finally {
      setIsAssetUploading(false);
      setActiveEditingSlideId(null);
    }
  };

  if (loading) {
    return (
      <div className={`${carouselTheme.container} animate-pulse`}>
        <div
          className={`${carouselTheme.layout} bg-stone-100 flex items-center justify-center`}
        >
          <div className={carouselTheme.slide.loadingSpinner} />
        </div>
      </div>
    );
  }

  if (slides.length === 0 && isAdminModeActive) {
    return (
      <div className={carouselTheme.container}>
        <PlusPlaceholder type="CAROUSEL" onClick={handleAddSlideTrigger} />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className={carouselTheme.container}>
      <div className={carouselTheme.layout}>
        {/* STAGED FILMSTRIP: Rasyonele Kesintisiz Kademeli Odak */}
        <motion.div
          drag={!isAdminModeActive && slides.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className={`flex w-full h-full gap-4 ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : 'transition-none'}`}
          onTransitionEnd={handleTransitionEnd}
          style={{
            // Layout Engine: Dynamically responsive offset math
            transform: isMobile
              ? `translateX(-${currentIndex * 100}%)`
              : `translateX(calc(20% - ${currentIndex * 60}% - ${currentIndex * 16}px))`,
          }}
        >
          {extendedSlides.map((slideItem, index) => {
            const isVisible = index === currentIndex;

            return (
              <div
                key={`${slideItem.id}-${index}`}
                className="relative w-full sm:w-[60%] h-full shrink-0"
              >
                <CarouselSlideUnit
                  slideData={slideItem}
                  isAdmin={isAdminModeActive}
                  isCurrentlyActive={isVisible}
                  isCurrentlyUploading={isAssetUploading}
                  editingTargetSlideId={activeEditingSlideId}
                  onImageUpdateTrigger={(id) => {
                    setIsAddingNewSlide(false);
                    setActiveEditingSlideId(id);
                    fileUploadInputRef.current?.click();
                  }}
                  onDeleteTrigger={deleteSlide}
                  onAddTrigger={handleAddSlideTrigger}
                  onReorderTrigger={reorderSlides}
                  currentIndex={index % (slides.length || 1) || slides.length}
                  totalSlides={slides.length}
                />
              </div>
            );
          })}
        </motion.div>

        {/* NAVIGATION: Panoramic Guard */}
        {slides.length > 1 && (
          <>
            <div
              className={`${carouselTheme.navigation.navBtnStyle} ${carouselTheme.navigation.prevPos} absolute top-1/2 -translate-y-1/2 z-50`}
            >
              <Button
                onClick={handlePrev}
                variant="glass"
                size="md"
                icon={globalIcons.chevronLeft}
              />
            </div>
            <div
              className={`${carouselTheme.navigation.navBtnStyle} ${carouselTheme.navigation.nextPos} absolute top-1/2 -translate-y-1/2 z-50`}
            >
              <Button
                onClick={handleNext}
                variant="glass"
                size="md"
                icon={globalIcons.chevronRight}
              />
            </div>
          </>
        )}

        {/* PAGINATION: Circular Insight */}
        {slides.length > 1 && (
          <div className={carouselTheme.navigation.dotsWrapper}>
            {slides.map((_, dotIndex) => {
              const isActive =
                (currentIndex - 1 + slides.length) % slides.length === dotIndex;
              return (
                <div
                  key={dotIndex}
                  className={`
                    ${carouselTheme.navigation.dotBase} 
                    ${isActive ? carouselTheme.navigation.dotActive : carouselTheme.navigation.dotInactive}
                  `}
                />
              );
            })}
          </div>
        )}

        <input
          type="file"
          ref={fileUploadInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUploadAction}
        />
      </div>
    </div>
  );
}
