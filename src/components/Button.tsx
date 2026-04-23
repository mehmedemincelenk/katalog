// FILE ROLE: Atomic UI Button Unit (Tokenized)
// DEPENDS ON: THEME config, React, cn util
// CONSUMED BY: Almost all UI components (Navbar, AdminMenu, Modals)

import { memo } from 'react';
import { THEME } from '../data/config';
import { cn } from '../utils/cn';

import { ButtonProps } from '../types';

/**
 * ATOMIC BUTTON COMPONENT (Diamond Standard)
 * -----------------------------------------------------------
 * Unified UI unit for all interactions. Refined for smoothness,
 * layout stability during loading, and premium tactile feedback.
 * Uses 'cn' utility for intelligent class merging.
 */
const Button = memo(
  ({
    onClick,
    icon,
    children,
    variant = 'secondary',
    size = 'md',
    mode = 'circle',
    className = '',
    disabled = false,
    type = 'button',
    title,
    loading = false,
    ...props
  }: ButtonProps) => {
    // 1. Style Resolution
    const variants = THEME.button.variants;
    const sizes = THEME.button.sizes[mode] || THEME.button.sizes.rectangle;

    const variantStyles = variants[variant] || variants.secondary;
    const sizeStyles =
      (sizes as Record<string, string>)[size] ||
      (sizes as Record<string, string>).md;

    // 2. Geometric Consistency
    const radius =
      mode === 'circle'
        ? 'rounded-full'
        : mode === 'square'
          ? 'rounded-md'
          : THEME.radius.button;

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        title={title}
        {...props}
        className={cn(
          THEME.button.base,
          radius,
          sizeStyles,
          variantStyles,
          loading && 'cursor-wait',
          'relative overflow-hidden transition-all active:scale-[0.98]',
          className,
        )}
      >
        {/* LOADING OVERLAY: Prevents layout shift by centering spinner over invisible content */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit/50 backdrop-blur-[1px] z-10">
            <div className={`${THEME.loading.spinner} w-4 h-4`} />
          </div>
        )}

        {/* CONTENT AREA: Visibility toggled to maintain layout dimensions during loading */}
        <div
          className={cn(
            'flex items-center justify-center',
            loading ? 'invisible' : 'visible',
          )}
        >
          {icon && (
            <span
              className={cn(
                'flex items-center justify-center shrink-0',
                children && 'mr-2',
              )}
            >
              {icon}
            </span>
          )}
          {children}
        </div>
      </button>
    );
  },
);

export default Button;
