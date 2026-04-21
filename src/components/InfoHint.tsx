import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoHintProps {
  message: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * INFOHINT COMPONENT (Diamond Guidance)
 * -----------------------------------------------------------
 * A sophisticated "?" button that reveals context-rich tooltips.
 */
export default function InfoHint({ message, className = '', position = 'top' }: InfoHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-stone-400 hover:text-stone-900 transition-colors focus:outline-none p-1"
      >
        <HelpCircle size={14} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className={`
              absolute z-[100] w-48 p-3 rounded-2xl bg-stone-900 text-white text-[10px] font-bold leading-relaxed shadow-2xl pointer-events-none text-center
              ${positionClasses[position]}
            `}
          >
            {message}
            {/* TOOLTIP ARROW */}
            <div 
              className={`
                absolute w-2 h-2 bg-stone-900 rotate-45
                ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
              `} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
