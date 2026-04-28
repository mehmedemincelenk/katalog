import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { MarqueeText } from './MarqueeText';
import { X, Menu } from 'lucide-react';
import { THEME } from '../data/config';

/**
 * BASE FLOATING MENU (DIAMOND FRAME)
 * -----------------------------------------------------------
 * Unified orchestrator for AssistiveTouch-style menus.
 * Handles expansion, auto-close, and outside-click logic.
 */

export interface FloatingAction {
  id: string;
  icon: ReactNode;
  action: () => void;
  label: string;
  primary?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass' | 'whatsapp' | 'kraft';
}

interface BaseFloatingMenuProps {
  actions: FloatingAction[];
  autoCloseDelay?: number;
  mainIcon?: ReactNode;
  activeMainIcon?: ReactNode;
  isPrimaryToggle?: boolean;
  labelText?: string;
}

export default function BaseFloatingMenu({
  actions,
  autoCloseDelay = 5000,
  mainIcon = <Menu className="w-full h-full p-0.5" strokeWidth={2.5} />,
  activeMainIcon = <X className="w-full h-full p-0.5" strokeWidth={2.5} />,
  isPrimaryToggle = true,
  labelText = 'MENÜ',
}: BaseFloatingMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const menuTheme = THEME.floatingAdminMenu;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleAction = (callback: () => void) => {
    clearTimer();
    callback();
    setIsExpanded(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('pointerdown', handleClickOutside);
      clearTimer();
      timerRef.current = setTimeout(() => setIsExpanded(false), autoCloseDelay);
    } else {
      document.removeEventListener('pointerdown', handleClickOutside);
      clearTimer();
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      clearTimer();
    };
  }, [isExpanded, autoCloseDelay, clearTimer]);

  return (
    <div ref={containerRef} className="z-[100]">
      <motion.div 
        layout
        className={menuTheme.container}
        transition={{ layout: { type: 'spring', stiffness: 500, damping: 40 } }}
      >
        {/* MASTER TOGGLE (Pinned at bottom of container) */}
        <div className="w-full">
          <Button
            onClick={() => {
              clearTimer();
              setIsExpanded((prev) => !prev);
            }}
            variant={isPrimaryToggle && !isExpanded ? 'secondary' : 'primary'}
            size="sm"
            mode="rectangle"
            className={`${isExpanded ? '!bg-white !text-stone-900 border-2 border-stone-100' : '!bg-stone-900 !text-white'} hover:scale-105 active:scale-95 transition-all h-11 sm:h-8 w-full shadow-none rounded-lg relative overflow-hidden`}
            aria-label={isExpanded ? 'Menüyü Kapat' : 'Menüyü Aç'}
          >
            <div className="flex flex-row items-center justify-center gap-1.5 w-full h-full">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {isExpanded ? activeMainIcon : mainIcon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                {labelText}
              </span>
            </div>
          </Button>
        </div>

        {/* ACTION CLUSTER (Above toggle, no gap) */}
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.div
              key="action-cluster"
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                height: { duration: 0.25, ease: "easeOut" },
                opacity: { duration: 0.15 }
              }}
              className="w-full flex flex-col items-center overflow-hidden"
            >
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
                }}
                className="flex flex-col gap-2 sm:gap-1 items-center w-full py-1"
              >
                {/* LABELED ACTIONS */}
                <div className="flex flex-col gap-2 sm:gap-1 items-center w-full px-1">
                  {actions.filter(a => a.label).map((btn) => (
                    <motion.div
                      key={btn.id}
                      variants={{
                        open: { opacity: 1, y: 0, scale: 1 },
                        closed: { opacity: 0, y: 10, scale: 0.8 }
                      }}
                      className="w-full"
                    >
                      <Button
                        onClick={() => handleAction(btn.action)}
                        icon={btn.icon}
                        variant={btn.variant || (btn.primary ? 'primary' : 'secondary')}
                        size="sm"
                        mode="rectangle"
                        className={`shrink-0 shadow-md rounded-xl sm:rounded-lg ${btn.className || ''} w-full !justify-start px-2 gap-2 h-[42px]`}
                      >
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <MarqueeText
                            text={btn.label}
                            textClass="text-[8px] font-black uppercase tracking-tighter"
                            isAdmin={false}
                          />
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* ICON ACTIONS */}
                <div className="grid grid-cols-2 gap-2 sm:gap-1 justify-items-center w-full px-1">
                  {actions.filter(a => !a.label).map((btn) => (
                    <motion.div
                      key={btn.id}
                      variants={{
                        open: { opacity: 1, y: 0, scale: 1 },
                        closed: { opacity: 0, y: 10, scale: 0.8 }
                      }}
                      className="w-full flex justify-center"
                    >
                      <Button
                        onClick={() => handleAction(btn.action)}
                        icon={btn.icon}
                        variant={btn.variant || (btn.primary ? 'primary' : 'secondary')}
                        size="sm"
                        mode="circle"
                        className={`shrink-0 shadow-md rounded-full sm:rounded-lg ${btn.className || ''} w-[42px] h-[42px] !p-0`}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
