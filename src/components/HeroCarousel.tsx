import { useState, useEffect, useCallback, useRef } from 'react';
import { THEME, LABELS, TECH } from '../data/config';
import { useCarousel } from '../hooks/useCarousel';
import Button from './Button';
import CarouselSlideUnit from './CarouselSlideUnit';

/**
 * HERO CAROUSEL COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * High-impact brand showcase. Manages sliding visual assets.
 */

interface HeroCarouselProps { 
  isAdminModeActive: boolean; 
}

export default function HeroCarousel({ isAdminModeActive }: HeroCarouselProps) {
  const { slides, uploadHeroImage, addSlide, deleteSlide, reorderSlides, loading } = useCarousel(isAdminModeActive);
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
      {/* ADMIN: ADD SLIDE FUNCTIONALITY (Görsel buton kaldırıldı, işlevsellik mevcut görsellere tıklanarak veya boş durumda sağlanıyor) */}
      
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
            onDeleteSlide={deleteSlide}
            onAddSlide={addSlide}
            onReorderSlide={reorderSlides}
            currentIndex={index + 1}
            totalSlides={slides.length}
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
            } catch {
              console.error("Resim yükleme hatası");
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
