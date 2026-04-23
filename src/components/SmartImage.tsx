import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveVisualAssetUrl } from '../utils/image';
import { THEME } from '../data/config';

import { SmartImageProps } from '../types';

/**
 * SMART IMAGE COMPONENT (Diamond Visual Polish)
 * -----------------------------------------------------------
 * Mağazanın görsel kalitesini koruyan akıllı muhafız.
 * - Fotoğraf yüklenirken "shimmer" (parlama) efekti gösterir.
 * - Yükleme bittiğinde yumuşak bir fade-in ile açılır.
 * - Hata durumunda şık bir placeholder gösterir.
 */

export default function SmartImage({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
  objectFit = 'cover',
  fallbackIcon,
  priority = false,
}: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );
  const resolvedSrc = resolveVisualAssetUrl(src);

  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus(src ? 'loading' : 'error');
  }

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'rectangle'
        ? 'aspect-[4/3]'
        : '';

  return (
    <div
      className={`relative overflow-hidden bg-stone-100 ${aspectClass} ${className}`}
    >
      {/* SHIMMER LOADING EFFECT (PREMIUM PATTERN) */}
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-stone-50 shimmer-animation opacity-50" />
            <div className="relative w-12 h-12 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin opacity-20" />
            {/* Subtle Diamond Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#000 0.5px, transparent 0.5px)',
                backgroundSize: '16px 16px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTUAL IMAGE */}
      {src && (
        <img
          src={resolvedSrc || ''}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : 'auto'}
          className={`
            w-full h-full transition-all duration-700 ease-out
            ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}
            ${status === 'loaded' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
          `}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}

      {/* ERROR / FALLBACK STATE */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 text-stone-300 p-4">
          {fallbackIcon || (
            <div className="w-8 h-8 opacity-20 mb-2">
              {THEME.icons.search} {/* Fallback icon from theme */}
            </div>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-center leading-tight">
            Görsel
            <br />
            Bulunamadı
          </span>
        </div>
      )}

      {/* GLOBAL SHIMMER CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-animation {
          animation: shimmer 2s infinite linear;
        }
      `,
        }}
      />
    </div>
  );
}
