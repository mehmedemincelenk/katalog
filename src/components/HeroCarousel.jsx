import { useState, useEffect, useCallback } from 'react';
import { CAROUSEL } from '../data/config';

export default function HeroCarousel() {
  const { slides, intervalMs, roundedClass } = CAROUSEL;
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs]);

  return (
    <div className={`relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4`}>
      <div className={`relative w-full h-full overflow-hidden ${roundedClass}`}>
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
              idx === activeIndex ? 'opacity-100' : 'opacity-0'
            } ${slide.bg}`}
          >
            {slide.src ? (
              <img
                src={slide.src}
                alt={slide.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}
            {/* Overlay text */}
            <div className="relative z-10 text-center px-6">
              <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
                {slide.label}
              </h2>
              <p className="mt-2 text-stone-200 text-base sm:text-lg font-medium drop-shadow">
                {slide.sub}
              </p>
            </div>
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
