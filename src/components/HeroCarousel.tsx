import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { CAROUSEL, TECH, LABELS } from '../data/config';
import { useCarousel } from '../hooks/useCarousel';

/**
 * HERO CAROUSEL BİLEŞENİ (MARKA VİTRİNİ)
 * -----------------------------------
 * Bir kurucu olarak bu bileşen senin "Dijital Bilboard"undur. 
 * 
 * 1. İlk Etki: Kullanıcı siteye girdiğinde karşılaştığı ilk görseldir. Marka duruşunu belirler.
 * 2. Dinamik Mesaj: Kampanyaları, yeni ürünleri veya "İstoç'tan ucuz" gibi sloganları burada vurgulayabilirsin.
 * 3. Kolay Güncelleme: Admin modundayken yazıların üzerine tıklayarak anında değiştirebilirsin (İş çevikliği).
 * 4. Mobil Uyumluluk: Parmakla kaydırma (Swipe) desteği ile modern bir deneyim sunar.
 */

interface HeroCarouselProps { isAdmin: boolean; }

/**
 * getImageUrl: Görsel yolunu akıllıca yönetir. 
 * Base64 (yüklenen) veya URL (dış bağlantı) ayrımını yapar.
 */
const getImageUrl = (path: string) => {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
};

interface Slide { id: number; src: string; bg: string; label: string; sub: string; }

/**
 * CarouselSlide: Tek bir afişin görüntüsünü ve düzenleme (Edit) yeteneğini yönetir.
 */
const CarouselSlide = memo(({ 
  slide, isActive, isAdmin, isUploading, editingSlideId, onImageClick, onUpdate 
}: { 
  slide: Slide, isActive: boolean, isAdmin: boolean, isUploading: boolean, 
  editingSlideId: number | null, onImageClick: (id: number) => void, onUpdate: (id: number, changes: Partial<Slide>) => void
}) => {
  const c = CAROUSEL; // config alias

  // Yazı değiştiğinde (Admin düzenlemesi) kaydet.
  const handleBlur = (field: 'label' | 'sub', e: React.FocusEvent<HTMLElement>) => {
    const val = e.currentTarget.textContent?.trim() || '';
    if (val !== (slide as any)[field]) onUpdate(slide.id, { [field]: val });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); }
  };

  return (
    <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'} ${slide.bg}`}>
      {/* AFİŞ GÖRSELİ: Tıklanınca admin için dosya seçiciyi açar. */}
      {slide.src ? (
        <img 
          src={getImageUrl(slide.src)} 
          alt={slide.label} 
          className={`absolute inset-0 w-full h-full object-cover ${isAdmin ? 'cursor-pointer' : ''} ${isUploading && editingSlideId === slide.id ? 'opacity-50 blur-sm' : ''}`} 
          onClick={() => isAdmin && !isUploading && onImageClick(slide.id)} 
        />
      ) : (
        <div className={`absolute inset-0 w-full h-full bg-stone-200 ${isAdmin ? 'cursor-pointer' : ''}`} onClick={() => isAdmin && !isUploading && onImageClick(slide.id)} />
      )}

      {/* Yükleme animasyonu */}
      {isUploading && editingSlideId === slide.id && isActive && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* METİN KUTUSU (GLASSMORPHISM): Cam efekti ile yazıların her resim üzerinde okunmasını sağlar. */}
      <div className={`absolute z-20 top-4 left-4 sm:top-8 sm:left-8 max-w-[80%] p-4 sm:p-6 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl`}>
        <h2
          className={`${c.titleColor} ${c.titleSizeMobile} ${c.titleSizePC} ${c.titleWeight} ${c.titleTracking} ${c.titleShadow} ${isAdmin ? 'cursor-text focus:outline-none bg-white/10 rounded px-1' : ''}`}
          contentEditable={isAdmin} suppressContentEditableWarning onBlur={(e) => handleBlur('label', e)} onKeyDown={handleKeyDown}
        >
          {slide.label}
        </h2>
        <p
          className={`${c.subColor} ${c.subSizeMobile} ${c.subSizePC} ${c.subWeight} ${c.subShadow} ${c.subLeading} ${isAdmin ? 'cursor-text focus:outline-none bg-white/10 rounded px-1 mt-1' : ''}`}
          contentEditable={isAdmin} suppressContentEditableWarning onBlur={(e) => handleBlur('sub', e)} onKeyDown={handleKeyDown}
        >
          {slide.sub}
        </p>
      </div>
    </div>
  );
});

export default function HeroCarousel({ isAdmin }: HeroCarouselProps) {
  const { slides, updateSlide } = useCarousel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const c = CAROUSEL;

  // Navigasyon Fonksiyonları
  const next = useCallback(() => setActiveIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  // MOBİL KAYDIRMA (SWIPE): Akıllı telefonlarda parmakla kaydırma özelliği.
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > c.swipeThreshold) next();
    if (distance < -c.swipeThreshold) prev();
    setTouchStart(0); setTouchEnd(0);
  };

  // OTOMATİK GEÇİŞ: Müşteri bir şey yapmasa da afişler döner.
  useEffect(() => {
    if (isAdmin || isUploading) return;
    const timer = setInterval(next, c.intervalMs);
    return () => clearInterval(timer);
  }, [next, c.intervalMs, isAdmin, isUploading]);

  return (
    <div className={`relative w-full group/carousel ${c.heightMobile} ${c.heightTablet} ${c.heightPC} overflow-hidden ${c.containerWidth} ${c.containerPadding} ${c.containerMargin}`}>
      <div className={`relative w-full h-full overflow-hidden ${c.roundedClass}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        
        {/* SLAYT DÖNGÜSÜ */}
        {slides.map((slide, idx) => (
          <CarouselSlide key={slide.id} slide={slide} isActive={idx === activeIndex} isAdmin={isAdmin} isUploading={isUploading} editingSlideId={editingSlideId} onImageClick={(id) => { setEditingSlideId(id); fileInputRef.current?.click(); }} onUpdate={updateSlide} />
        ))}

        {/* NAVİGASYON OKLARI (Bilgisayar ve Tablet için) */}
        {!isAdmin && (
          <>
            <button 
              onClick={prev} 
              className={`${c.navBtnStyle} ${c.navBtnLeft} opacity-0 group-hover/carousel:opacity-100 hidden sm:flex`}
              aria-label="Önceki Afiş"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={next} 
              className={`${c.navBtnStyle} ${c.navBtnRight} opacity-0 group-hover/carousel:opacity-100 hidden sm:flex`}
              aria-label="Sonraki Afiş"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}

        {/* GİZLİ RESİM SEÇİCİ (Admin Fotoğraf Değiştirme) */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !editingSlideId) return;
          setIsUploading(true);
          try {
            const { compressImage } = await import('../utils/image');
            // TEKNİK: Afişler için 1200px genişlik kullanıyoruz (Yüksek kalite).
            const compressedStr = await compressImage(file, TECH.image.heroSize, TECH.image.uploadQuality);
            updateSlide(editingSlideId, { src: compressedStr });
          } catch { alert(LABELS.saveError); } finally { setIsUploading(false); setEditingSlideId(null); }
          e.target.value = '';
        }} />

        {/* AFİŞ NOKTALARI (İndikatörler) */}
        <div className={`absolute ${c.dotPosition} left-1/2 -translate-x-1/2 flex ${c.dotGap} z-10`}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setActiveIndex(i)} className={`${c.dotSize} rounded-full transition-all duration-300 ${i === activeIndex ? c.dotActive : c.dotInactive}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
