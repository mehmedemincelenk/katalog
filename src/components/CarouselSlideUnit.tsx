import { memo } from 'react';
import { THEME } from '../data/config';
import { Slide } from '../hooks/useCarousel';
import OrderSelector from './OrderSelector';
import Button from './Button';

interface CarouselSlideUnitProps {
  slideData: Slide;
  isCurrentlyActive: boolean;
  isAdmin: boolean;
  isCurrentlyUploading: boolean;
  editingTargetSlideId: number | null;
  onImageUpdateTrigger: (id: number) => void;
  onDeleteSlide?: (id: number) => void;
  onAddSlide?: () => void;
  onReorderSlide?: (id: number, newIndex: number) => void;
  currentIndex: number;
  totalSlides: number;
}

const CarouselSlideUnit = memo(({ 
  slideData, 
  isCurrentlyActive, 
  isAdmin, 
  isCurrentlyUploading, 
  editingTargetSlideId, 
  onImageUpdateTrigger, 
  onDeleteSlide, 
  onAddSlide,
  onReorderSlide,
  currentIndex,
  totalSlides
}: CarouselSlideUnitProps) => {
  const carouselTheme = THEME.heroCarousel;
  const globalIcons = THEME.icons;

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

      {/* ADMIN CONTROLS ON SLIDE: Repositioned to bottom-right vertical stack */}
      {isAdmin && isCurrentlyActive && (
        <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2">
          <OrderSelector 
            currentOrder={currentIndex}
            totalCount={totalSlides}
            onChange={(newIdx) => onReorderSlide?.(slideData.id, newIdx)}
          />

          <Button 
            onClick={(e) => { e.stopPropagation(); onAddSlide?.(); }}
            variant="glass"
            mode="square"
            size="xs"
            icon={globalIcons.plus}
            title="Yeni Slide Ekle"
          />
          <Button 
            onClick={(e) => { e.stopPropagation(); onDeleteSlide?.(slideData.id); }}
            variant="danger"
            mode="square"
            size="xs"
            icon={globalIcons.trash}
            title="Slide Sil"
          />
        </div>
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

export default CarouselSlideUnit;
