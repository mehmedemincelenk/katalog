// FILE ROLE: Foundation Component for all Modals (Diamond Standard)
// DEPENDS ON: framer-motion, THEME tokens
// CONSUMED BY: AddProductModal, EditProdCard, etc.

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Button from './Button';

import { BaseModalProps } from '../types';
import { useScrollLock, useKeyboard, useFocusTrap } from '../hooks/useUI';

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-md',
  children,
  footer,
  progress,
  hideCloseButton = false,
  disableClickOutside = false,
  className = '',
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // 1. MODULAR ORCHESTRATION (Diamond UI Hooks)
  useScrollLock(isOpen);
  useKeyboard('Escape', onClose, isOpen && !disableClickOutside);
  useFocusTrap(modalRef as React.RefObject<HTMLElement>, isOpen);

  const handleBackdropClick = () => {
    if (!disableClickOutside) {
      onClose();
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 print:p-0 print:block print:relative print:z-auto">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm print:hidden"
          />

          {/* MODAL CONTAINER */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              relative w-full ${maxWidth} bg-white 
              rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] 
              overflow-hidden flex flex-col max-h-[90vh] border border-stone-100 
              print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full print:rounded-none
              ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={subtitle ? descId : undefined}
            tabIndex={-1}
          >
            {/* CLOSE BUTTON */}
            {!hideCloseButton && (
              <div className="absolute top-4 right-4 z-10 shrink-0 print:hidden">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                  mode="circle"
                  className="!bg-stone-100/80 !text-stone-500 hover:!bg-stone-200 hover:!text-stone-900 shadow-none border-none"
                  icon={<X size={16} strokeWidth={3} />}
                  title="Kapat"
                />
              </div>
            )}

            {/* HEADER AREA */}
            {(title || icon) && !progress && (
              <div className="flex flex-col items-start mt-6 px-6 text-left shrink-0 print:hidden">
                {icon && (
                  <div className="w-16 h-16 bg-stone-50 text-stone-500 rounded-full flex items-center justify-center text-3xl mb-4 border border-stone-100 shadow-inner">
                    {icon}
                  </div>
                )}
                {title && (
                  <h3
                    id={titleId}
                    className="text-xl font-black text-stone-900 uppercase tracking-tight leading-tight"
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p
                    id={descId}
                    className="text-[11px] font-bold text-stone-400 mt-2"
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* WIZARD HEADER (Title + Progress Dots) */}
            {progress && (
              <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50 print:hidden shrink-0">
                <div className="flex flex-col">
                  {title && (
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest leading-none mb-3">
                      {title}
                    </h3>
                  )}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: progress.total }).map((_, idx) => {
                      const stepNumber = idx + 1;
                      const isActive = progress.current >= stepNumber;
                      return (
                        <div
                          key={stepNumber}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isActive ? 'bg-stone-900 w-6' : 'bg-stone-200 w-3'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto print:overflow-visible custom-scrollbar print:h-auto px-6 py-6">
              {children}
            </div>

            {/* FOOTER ACTIONS */}
            {footer && (
              <div className="p-4 sm:p-6 border-t border-stone-100 bg-stone-50/50 print:hidden shrink-0 mt-auto">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
