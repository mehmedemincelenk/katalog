// FILE ROLE: High-End Minimal Loading Spinner
// DEPENDS ON: Lucide React (or SVG), Tailwind
// CONSUMED BY: ProductCard, HeroCarousel, AIStudio
import React from 'react';

import { LoadingProps } from '../types';

/**
 * LOADING COMPONENT (DIAMOND STANDARD)
 * -----------------------------------------------------------
 * A pure, elegant spinner that replaces redundant loading labels.
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'dark',
  label,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const variantClasses = {
    dark: 'border-stone-200 border-t-stone-800',
    light: 'border-white/20 border-t-white',
    white: 'border-gray-100 border-t-white shadow-sm',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          rounded-full animate-spin
        `}
      />
      {label && (
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          {label}
        </span>
      )}
    </div>
  );
};

export default Loading;
