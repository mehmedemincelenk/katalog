import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderSelectorProps {
  currentOrder: number;
  totalCount: number;
  onChange: (newOrder: number) => void;
  variant?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * UNIVERSAL ORDER SELECTOR (Visual consistent across entire project)
 * -----------------------------------------------------------
 * Uses a ghost select overlay to trigger native dropdowns while 
 * maintaining high-end animated visuals.
 */
const OrderSelector = memo(({ 
  currentOrder, 
  totalCount, 
  onChange, 
  variant = 'small',
  className = ''
}: OrderSelectorProps) => {
  const sizeClass = variant === 'small' ? 'w-7 h-7' : (variant === 'medium' ? 'w-8 h-8' : 'w-10 h-10');
  const radiusClass = 'rounded-md'; // Rounded square
  
  return (
    <div 
      className={`relative flex items-center justify-center bg-white/95 backdrop-blur-md shadow-2xl border border-white/40 cursor-pointer hover:bg-white transition-all active:scale-95 group ${sizeClass} ${radiusClass} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* DISPLAY NUMBER WITH ODOMETER ANIMATION */}
      <div className="flex items-center justify-center overflow-hidden h-4 w-6 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentOrder}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`text-stone-900 font-black absolute tracking-tighter ${variant === 'large' ? 'text-[14px]' : 'text-[12px]'}`}
          >
            {currentOrder}.
          </motion.span>
        </AnimatePresence>
      </div>

      {/* GHOST SELECT DROPDOWN (Native behavior is best for "Scroll Picker" feel on mobile, enhanced on desktop) */}
      <select 
        value={currentOrder}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (val !== currentOrder) onChange(val);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
        onClick={(e) => e.stopPropagation()}
      >
        {Array.from({ length: totalCount }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
});

export default OrderSelector;
