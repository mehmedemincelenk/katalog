// FILE ROLE: Guest Utility Hub (AssistiveTouch style menu)
// DEPENDS ON: THEME, motion, All Guest Modals (Price List, Coupons)
// CONSUMED BY: App.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../data/config';
import Button from './Button';
import {
  Phone,
  FileSpreadsheet,
  Ticket,
  Menu,
  X,
  Search,
  QrCode,
} from 'lucide-react';

/**
 * FLOATING GUEST MENU COMPONENT
 * -----------------------------------------------------------
 * Replaces simple currency switcher with a fully animated AssistiveTouch hub for guests.
 */

import { useStore } from '../store/useStore';

import { FloatingGuestMenuProps } from '../types';

export default function FloatingGuestMenu({
  onCouponClick,
  onExcelClick,
  onSearchClick,
  onQRClick,
}: FloatingGuestMenuProps) {
  const {
    visitorCurrency: activeCurrency,
    toggleVisitorCurrency: onCurrencyToggle,
    settings,
  } = useStore();

  const whatsappNumber = settings?.whatsapp || '';
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const menuTheme = THEME.floatingAdminMenu;

  const clearAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handlePointerDownOutside = (event: PointerEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuExpanded(false);
      }
    };

    if (isMenuExpanded) {
      document.addEventListener('pointerdown', handlePointerDownOutside);
      clearAutoCloseTimer();
      // Auto-close after 5 seconds of inactivity
      autoCloseTimerRef.current = setTimeout(
        () => setIsMenuExpanded(false),
        5000,
      );
    } else {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      clearAutoCloseTimer();
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      clearAutoCloseTimer();
    };
  }, [isMenuExpanded, clearAutoCloseTimer]);

  const handleAction = (actionCallback: () => void) => {
    clearAutoCloseTimer();
    actionCallback();
    setIsMenuExpanded(false);
  };

  const handleCall = () => {
    // Normal phone call trigger using "tel:" protocol
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  return (
    <div ref={menuContainerRef}>
      <div
        className={`${menuTheme.container} overflow-hidden w-[46px] flex flex-col items-center justify-end shadow-2xl`}
      >
        {/* EXPANDABLE ACTION AREA */}
        <AnimatePresence>
          {isMenuExpanded && (
            <motion.div
              key="expanded-actions"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  height: 'auto',
                  opacity: 1,
                  marginBottom: 8,
                  transition: {
                    height: { type: 'spring', stiffness: 300, damping: 30 },
                    staggerChildren: 0.05,
                    delayChildren: 0.1,
                  },
                },
                closed: {
                  height: 0,
                  opacity: 0,
                  marginBottom: 0,
                  transition: {
                    height: { type: 'spring', stiffness: 300, damping: 35 },
                    staggerChildren: 0.03,
                    staggerDirection: -1,
                  },
                },
              }}
              className="flex flex-col gap-2 items-center w-full"
              style={{ transformOrigin: 'bottom' }}
            >
              {(
                [
                  {
                    id: 'currency',
                    icon: (
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="text-[17px] font-black">
                          {activeCurrency === 'TRY'
                            ? '₺'
                            : activeCurrency === 'USD'
                              ? '$'
                              : '€'}
                        </span>
                        <span className="text-[7px] font-bold uppercase tracking-tighter opacity-50 -mt-0.5">
                          {activeCurrency}
                        </span>
                      </div>
                    ),
                    action: onCurrencyToggle,
                    label: 'Para Birimi',
                    className:
                      'border-2 border-stone-100 text-stone-900 bg-white',
                  },
                  {
                    id: 'qr',
                    icon: (
                      <QrCode className="w-full h-full p-1" strokeWidth={2.5} />
                    ),
                    action: onQRClick,
                    label: 'Dükkan QR',
                    className:
                      'bg-white text-stone-900 border-2 border-stone-100 hover:bg-stone-50',
                  },
                  {
                    id: 'call',
                    icon: (
                      <Phone className="w-full h-full p-1" strokeWidth={2.5} />
                    ),
                    action: handleCall,
                    label: 'Bizi Arayın',
                    className:
                      'bg-white text-stone-900 border-2 border-stone-100 hover:bg-stone-50',
                  },
                  {
                    id: 'excel',
                    icon: (
                      <FileSpreadsheet
                        className="w-full h-full p-1"
                        strokeWidth={2.5}
                      />
                    ),
                    action: onExcelClick,
                    label: 'Fiyat Listesi',
                    className:
                      'bg-white text-stone-900 border-2 border-stone-100 hover:bg-stone-50',
                  },
                  {
                    id: 'coupon',
                    icon: (
                      <Ticket
                        className="w-full h-full p-0.5"
                        strokeWidth={2.5}
                      />
                    ),
                    action: onCouponClick,
                    label: 'Kupon Gir',
                    className:
                      'bg-white text-stone-900 border-2 border-stone-100 hover:bg-stone-50',
                  },
                  {
                    id: 'search',
                    icon: (
                      <Search className="w-full h-full p-1" strokeWidth={2.5} />
                    ),
                    action: onSearchClick,
                    label: 'Ürün Ara',
                    className:
                      'bg-white text-stone-900 border-2 border-stone-100 hover:bg-stone-50',
                  },
                ].filter(Boolean) as {
                  id: string;
                  icon: React.ReactNode;
                  action: () => void;
                  label: string;
                  primary?: boolean;
                  className?: string;
                }[]
              ).map((btn) => (
                <motion.div
                  key={btn.id}
                  variants={{
                    open: { opacity: 1, y: 0, scale: 1 },
                    closed: { opacity: 0, y: 15, scale: 0.5 },
                  }}
                  className="w-full flex justify-center"
                >
                  <Button
                    onClick={() => handleAction(btn.action)}
                    icon={btn.icon}
                    variant="secondary"
                    size="sm"
                    mode="circle"
                    className={`shrink-0 shadow-md ${btn.className || ''}`}
                    aria-label={btn.label}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN TOGGLE CONTROL */}
        <div className="flex items-center justify-center p-0.5">
          <Button
            onClick={() => {
              clearAutoCloseTimer();
              setIsMenuExpanded((previousState) => !previousState);
            }}
            icon={
              isMenuExpanded ? (
                <X className="w-full h-full p-0.5" strokeWidth={2.5} />
              ) : (
                <Menu className="w-full h-full p-0.5" strokeWidth={2.5} />
              )
            }
            variant="primary"
            size="sm"
            mode="circle"
            className="!bg-stone-900 !text-white hover:scale-105 active:scale-95 transition-all w-10 h-10 shadow-lg"
            aria-label={isMenuExpanded ? 'Menüyü Kapat' : 'Menüyü Aç'}
          />
        </div>
      </div>
    </div>
  );
}
