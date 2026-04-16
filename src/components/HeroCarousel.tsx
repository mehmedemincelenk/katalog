import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { THEME, LABELS, TECH } from '../data/config';
import { useCarousel, Slide } from '../hooks/useCarousel';
import Button from './Button';

/**
 * HERO CAROUSEL COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * High-impact brand showcase. Manages sliding visual assets.
 */

interface HeroCarouselProps { 
  isAdminModeActive: boolean; 
}

const CarouselSlideUnit = memo(({ 
  slideData, isCurrentlyActive, isAdmin, isCurrentlyUploading, editingTargetSlideId, onImageUpdateTrigger
}: { 
  slideData: Slide, isCurrentlyActive: boolean, isAdmin: boolean, isCurrentlyUploading: boolean, 
  editingTargetSlideId: number | null, onImageUpdateTrigger: (id: number) => void
}) => {
  const carouselTheme = THEME.heroCarousel;

  return (
    <div className={`
      ${carouselTheme.slide.base} 
      ${isCurrentlyActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'} 
      ${slideData.bg}
    `}>
      {/* BACKGROUND IMAGE OR PLACEHOLDER */}
      {slideData.src ? (
        <img 
          src={slideData.src} 
          alt={slideData.label} 
          className={`
            ${carouselTheme.slide.image} 
            ${isAdmin ? 'cursor-pointer' : ''} 
            ${isCurrentlyUploading && editingTargetSlideId === slideData.id ? carouselTheme.slide.loadingBlur : ''}
          `} 
          onClick={() => isAdmin && !isCurrentlyUploading && onImageUpdateTrigger(slideData.id)} 
          loading={isCurrentlyActive ? "eager" : "lazy"}
          {...(isCurrentlyActive ? { fetchpriority: "high" } : {})}
        />
      ) : (
        <div 
          className={`${carouselTheme.slide.image} ${carouselTheme.slide.placeholderBg} ${isAdmin ? 'cursor-pointer' : ''}`} 
          onClick={() => isAdmin && !isCurrentlyUploading && onImageUpdateTrigger(slideData.id)} 
        />
      )}

      {/* UPLOAD PROGRESS VISUAL */}
      {isCurrentlyUploading && editingTargetSlideId === slideData.id && isCurrentlyActive && (
        <div className={carouselTheme.slide.overlay}>
          <div className={carouselTheme.slide.loadingSpinner}></div>
        </div>
      )}

    </div>
  );
});

export default function HeroCarousel({ isAdminModeActive }: HeroCarouselProps) {
  const { slides, uploadHeroImage, addSlide, loading } = useCarousel(isAdminModeActive);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const [activeEditingSlideId, setActiveEditingSlideId] = useState<number | null>(null);
  const [isAssetUploading, setIsAssetUploading] = useState(false);
  const [currentlyActiveSlideIndex, setCurrentlyActiveSlideIndex] = useState(0);
  const [swipeTouchStart, setSwipeTouchStart] = useState(0);
  const [swipeTouchEnd, setSwipeTouchEnd] = useState(0);

  const carouselTheme = THEME.heroCarousel;
  const globalIcons = THEME.icons;

  const navigateToNextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentlyActiveSlideIndex((previousIndex) => (previousIndex + 1) % slides.length);
  }, [slides.length]);

  const navigateToPreviousSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentlyActiveSlideIndex((previousIndex) => (previousIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    setSwipeTouchStart(event.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    setSwipeTouchEnd(event.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!swipeTouchStart || !swipeTouchEnd) return;
    const distanceSwiped = swipeTouchStart - swipeTouchEnd;
    if (distanceSwiped > TECH.carousel.swipeThreshold) navigateToNextSlide();
    if (distanceSwiped < -TECH.carousel.swipeThreshold) navigateToPreviousSlide();
    setSwipeTouchStart(0); 
    setSwipeTouchEnd(0);
  }, [swipeTouchStart, swipeTouchEnd, navigateToNextSlide, navigateToPreviousSlide]);

  // Automatic slide rotation
  useEffect(() => {
    if (isAdminModeActive || isAssetUploading || slides.length <= 1) return;
    const rotationInterval = setInterval(navigateToNextSlide, TECH.carousel.intervalMs);
    return () => clearInterval(rotationInterval);
  }, [navigateToNextSlide, isAdminModeActive, isAssetUploading, slides.length]);

  if (loading && slides.length === 0) return null;

  // Empty state for Admin
  if (slides.length === 0 && isAdminModeActive) {
    return (
      <div className={`${carouselTheme.layout} ${carouselTheme.container} !aspect-[21/9] sm:!aspect-[3/1]`}>
        <div 
          onClick={addSlide}
          className="w-full h-full border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-stone-50 transition-all rounded-2xl bg-white shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <span className="w-6 h-6">{globalIcons.plus}</span>
          </div>
          <span className="text-stone-500 font-black uppercase text-xs tracking-widest">İlk Slider Görselini Ekle</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      ${carouselTheme.layout} 
      ${carouselTheme.container}
    `}>
      {/* ADMIN: ADD SLIDE BUTTON (Top Left Overlay) */}
      {isAdminModeActive && (
        <Button 
          onClick={addSlide} 
          icon={globalIcons.plus}
          variant="glass"
          size="sm"
          className="absolute top-4 left-4 z-[100] !rounded-full shadow-2xl bg-white/90"
        />
      )}

      <div 
        className={`relative w-full h-full overflow-hidden ${THEME.radius.carousel}`} 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
      >
        
        {slides.map((slideItem, index) => (
          <CarouselSlideUnit 
            key={slideItem.id} 
            slideData={slideItem} 
            isCurrentlyActive={index === currentlyActiveSlideIndex} 
            isAdmin={isAdminModeActive} 
            isCurrentlyUploading={isAssetUploading} 
            editingTargetSlideId={activeEditingSlideId} 
            onImageUpdateTrigger={(id) => { setActiveEditingSlideId(id); fileUploadInputRef.current?.click(); }} 
          />
        ))}

        {/* NAVIGATION CONTROLS */}
        {!isAdminModeActive && slides.length > 1 && (
          <>
            <Button 
              onClick={navigateToPreviousSlide} 
              icon={globalIcons.chevronLeft}
              variant="glass"
              size="md"
              className={`${carouselTheme.navigation.navBtnStyle} ${carouselTheme.navigation.prevPos}`} 
              aria-label={LABELS.carousel.prevAria}
            />
            <Button 
              onClick={navigateToNextSlide} 
              icon={globalIcons.chevronRight}
              variant="glass"
              size="md"
              className={`${carouselTheme.navigation.navBtnStyle} ${carouselTheme.navigation.nextPos}`} 
              aria-label={LABELS.carousel.nextAria}
            />
          </>
        )}

        {/* HIDDEN FILE INPUT FOR IMAGE UPDATES */}
        <input 
          ref={fileUploadInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={async (event) => {
            const selectedFile = event.target.files?.[0];
            if (!selectedFile || !activeEditingSlideId) return;
            setIsAssetUploading(true);
            try {
              await uploadHeroImage(activeEditingSlideId, selectedFile);
            } catch (error) { 
              alert(LABELS.saveError); 
            } finally { 
              setIsAssetUploading(false); 
              setActiveEditingSlideId(null); 
            }
            event.target.value = '';
          }} 
        />

        {/* PAGINATION INDICATORS */}
        {slides.length > 1 && (
          <div className={carouselTheme.navigation.dotsWrapper}>
            {slides.map((_, dotIndex) => (
              <button 
                key={dotIndex} 
                onClick={() => setCurrentlyActiveSlideIndex(dotIndex)} 
                className={`
                  ${carouselTheme.navigation.dotBase} 
                  ${dotIndex === currentlyActiveSlideIndex ? carouselTheme.navigation.dotActive : carouselTheme.navigation.dotInactive}
                `} 
                aria-label={LABELS.carousel.dotAria(dotIndex)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
