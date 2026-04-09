import React from 'react';

/**
 * FloatingButton: Sitenin her yerinde kullanılan standart yüzen buton şablonu.
 * Apple Minimalizmi ve Modüler Yapı (Engineering Excellence) esas alınmıştır.
 */
interface FloatingButtonProps {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'kraft';
  className?: string;
  showLabel?: boolean;
}

export default function FloatingButton({ 
  onClick, icon, label, variant = 'secondary', className = '', showLabel = true 
}: FloatingButtonProps) {
  
  const variants = {
    primary: 'bg-stone-900 text-white border-white/20 hover:bg-stone-800',
    secondary: 'bg-white text-stone-900 border-stone-200 hover:bg-stone-50',
    danger: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white',
    success: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white',
    kraft: 'bg-kraft-600 text-white border-kraft-700 hover:bg-kraft-700',
  };

  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border-2 transition-all active:scale-90 group relative ${variants[variant]} ${className}`}
    >
      <span className="text-xl leading-none flex items-center justify-center">{icon}</span>
      
      {label && showLabel && (
        <span className="absolute right-14 bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[110] shadow-xl">
          {label}
        </span>
      )}
    </button>
  );
}
