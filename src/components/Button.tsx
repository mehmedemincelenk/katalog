// FILE: src/components/Button.tsx
// ROLE: Reusable, theme-driven button component used across the application
// READS FROM: src/data/config
// USED BY: Nearly every component with clickable actions

import { memo } from 'react';
import { THEME } from '../data/config';

/**
 * ATOMIC BUTTON COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Unified UI unit for all interactions. Managed via central THEME tokens.
 */

interface ButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: keyof typeof THEME.button.variants;
  size?: keyof typeof THEME.button.sizes.circle; // Sizes are shared across modes
  mode?: 'circle' | 'rectangle' | 'square';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  title?: string;
  loading?: boolean;
}

// ARCHITECTURE: Button
// PURPOSE: A highly flexible atomic button component supporting various variants (primary, secondary, danger), shapes, and loading states, completely styled by THEME
// DEPENDENCIES: THEME.button
// CONSUMERS: Used globally
const Button = memo(({ 
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
  loading = false
}: ButtonProps) => {
  const buttonTheme = THEME.button;
  const variantStyles = buttonTheme.variants[variant as keyof typeof buttonTheme.variants] || buttonTheme.variants.secondary;
  const sizeStyles = buttonTheme.sizes[mode as keyof typeof buttonTheme.sizes][size as keyof (typeof buttonTheme.sizes)['circle']] || buttonTheme.sizes.circle.md;
  
  const getRadius = () => {
    if (mode === 'circle') return 'rounded-full';
    if (mode === 'square') return 'rounded-md';
    return THEME.radius.button;
  };

  const globalRadius = getRadius();

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`
        ${buttonTheme.base} 
        ${globalRadius} 
        ${sizeStyles} 
        ${variantStyles} 
        ${className}
        ${loading ? 'opacity-80 cursor-wait' : ''}
      `}
    >
      {loading ? (
        <div className={`${THEME.loading.spinner} w-4 h-4`} />
      ) : (
        <>
          {/* ICON AREA: Scaled for Apple-style refined aesthetics */}
          {icon && (
            <span className={`
              ${children ? 'mr-2' : ''} 
              flex items-center justify-center scale-75
            `}>
              {icon}
            </span>
          )}
          
          {/* CONTENT AREA */}
          {children}
        </>
      )}
    </button>
  );
});

export default Button;
