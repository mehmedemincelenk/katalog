// FILE ROLE: Atomic UI Button Unit (Tokenized)
// DEPENDS ON: THEME config, React
// CONSUMED BY: Almost all UI components (Navbar, AdminMenu, Modals)
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
