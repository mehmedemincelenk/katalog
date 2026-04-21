// FILE ROLE: High-Impact Visual Showcase Component (Hero Carousel)
// DEPENDS ON: THEME, useCarousel hook, CarouselSlideUnit
// CONSUMED BY: App.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { THEME, LABELS, TECH } from '../data/config';
import { useCarousel } from '../hooks/useCarousel';
import Button from './Button';
import CarouselSlideUnit from './CarouselSlideUnit';

/**
 * HERO CAROUSEL COMPONENT (Diamond Standard Upgrade)
 * -----------------------------------------------------------
 * High-impact brand showcase with intelligent focus and rapid asset ingestion.
 */

interface HeroCarouselProps { 
  isAdminModeActive: boolean; 
}

export default function HeroCarousel({ isAdminModeActive }: HeroCarouselProps) {
  const { slides, uploadHeroImage, addSlide, deleteSlide, reorderSlides, loading } = useCarousel(isAdminModeActive);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  
  // States for sophisticated interaction management
  const [activeEditingSlideId, setActiveEditingSlideId] = useState<number | null>(null);
  const [isAddingNewSlide, setIsAddingNewSlide] = useState(false);
  const [isAssetUploading, setIsAssetUploading] = useState(false);
  const [currentlyActiveSlideIndex, setCurrentlyActiveSlideIndex] = useState(0);
  
  // Touch/Swipe state
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

  // Handle reordering with automatic focus jump
  const handleReorderWithFocus = async (slideId: number, targetDisplayIndex: number) => {
    await reorderSlides(slideId, targetDisplayIndex);
    // Focus the new position immediately
    setCurrentlyActiveSlideIndex(targetDisplayIndex - 1);
  };

  // Add slide logic: Trigger file input directly
  const handleAddSlideTrigger = () => {
    setIsAddingNewSlide(true);
    setActiveEditingSlideId(null);
    fileUploadInputRef.current?.click();
  };

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
          onClick={handleAddSlideTrigger}
          className="w-full h-full border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-stone-50 transition-all rounded-2xl bg-white shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <span className="w-6 h-6">{globalIcons.plus}</span>
          </div>
          <span className="text-stone-500 font-black uppercase text-xs tracking-widest">İlk Slider Görselini Ekle</span>
        </div>
        <input ref={fileUploadInputRef} type="file" accept="image/*" className="hidden" 
          onChange={async (event) => {
            const selectedFile = event.target.files?.[0];
            if (!selectedFile) return;
            setIsAssetUploading(true);
            try {
              // Creating a placeholder first to get an ID
              const nextId = slides.length > 0 ? Math.max(...slides.map(s => s.id)) + 1 : 1;
              await addSlide();
              // After adding, we need the latest ID. Since addSlide is async and updates state, 
              // it's cleaner to handle this in the main input's onChange.
              await uploadHeroImage(nextId, selectedFile);
              setCurrentlyActiveSlideIndex(slides.length); // Focus the newest slide
            } catch {
              console.error("Resim yükleme hatası");
            } finally { 
              setIsAssetUploading(false); 
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`
      ${carouselTheme.layout} 
      ${carouselTheme.container}
    `}>
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
            onImageUpdateTrigger={(id) => { setIsAddingNewSlide(false); setActiveEditingSlideId(id); fileUploadInputRef.current?.click(); }} 
            onDeleteSlide={deleteSlide}
            onAddSlide={handleAddSlideTrigger}
            onReorderSlide={handleReorderWithFocus}
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

        {/* HIDDEN FILE INPUT FOR IMAGE UPDATES & ADDS */}
        <input 
          ref={fileUploadInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={async (event) => {
            const selectedFile = event.target.files?.[0];
            if (!selectedFile) return;
            setIsAssetUploading(true);
            
            try {
              if (isAddingNewSlide) {
                 // 1. Create a dummy slide entry, get its ID (deterministic based on hook logic)
                 const nextId = slides.length > 0 ? Math.max(...slides.map(s => s.id)) + 1 : 1;
                 await addSlide(); // This adds to DB/State
                 // 2. Immediately upload the image to this new ID
                 await uploadHeroImage(nextId, selectedFile);
                 // 3. Focus the new slide (last index)
                 setCurrentlyActiveSlideIndex(slides.length);
              } else if (activeEditingSlideId) {
                 // Regular update
                 await uploadHeroImage(activeEditingSlideId, selectedFile);
              }
            } catch (err) {
              console.error("Carousel update error:", err);
            } finally { 
              setIsAssetUploading(false); 
              setActiveEditingSlideId(null);
              setIsAddingNewSlide(false); 
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
