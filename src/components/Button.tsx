import React, { memo } from 'react';
import { THEME } from '../data/config';

/**
 * ATOMIC BUTTON COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Unified UI unit for all interactions. Managed via central THEME tokens.
 */

interface ButtonProps {
  onClick: (event: React.MouseEvent) => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: keyof typeof THEME.button.variants;
  size?: keyof typeof THEME.button.sizes.circle; // Sizes are shared across modes
  mode?: 'circle' | 'rectangle';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const Button = memo(({ 
  onClick, 
  icon, 
  children,
  variant = 'secondary', 
  size = 'md', 
  mode = 'circle',
  className = '', 
  disabled = false,
  type = 'button'
}: ButtonProps) => {
  
  const buttonTheme = THEME.button;
  const variantStyles = buttonTheme.variants[variant];
  const sizeStyles = buttonTheme.sizes[mode][size];
  const globalRadius = mode === 'circle' ? 'rounded-full' : THEME.radius.button;

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${buttonTheme.base} 
        ${globalRadius} 
        ${sizeStyles} 
        ${variantStyles} 
        ${className}
      `}
    >
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
    </button>
  );
});

export default Button;
