import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../data/config';
import Button from './Button';

/**
 * FLOATING ADMIN MENU COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * AssistiveTouch-style management hub. Fully managed via central THEME.
 */

import { useStore } from '../store/useStore';

import { FloatingAdminMenuProps } from '../types';

export default function FloatingAdminMenu({
  onProductAddTrigger,
  onBulkUpdateTrigger,
  onSettingsTrigger,
}: FloatingAdminMenuProps) {
  const { settings, updateSetting } = useStore();
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const menuTheme = THEME.floatingAdminMenu;
  const globalIcons = THEME.icons;

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
      // Auto-close after 3 seconds of inactivity
      autoCloseTimerRef.current = setTimeout(
        () => setIsMenuExpanded(false),
        3000,
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

  if (!settings) return null;

  const activeCurrency = settings.activeCurrency;

  const onCurrencyToggle = () => {
    const cycle: Record<string, typeof activeCurrency> = {
      TRY: 'USD',
      USD: 'EUR',
      EUR: 'TRY',
    };
    const next = cycle[activeCurrency] || 'TRY';
    updateSetting('activeCurrency', next);
  };

  const handleManagementAction = (actionCallback: () => void) => {
    clearAutoCloseTimer();
    actionCallback();
    setIsMenuExpanded(false);
  };

  return (
    <div ref={menuContainerRef}>
      <div
        className={`${menuTheme.container} overflow-hidden w-[46px] flex flex-col items-center justify-end`}
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
                  marginBottom: 8, // Spacing only when open
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
                      'border-2 border-stone-900 text-stone-900 bg-white',
                  },
                  {
                    id: 'add',
                    icon: globalIcons.plus,
                    action: onProductAddTrigger,
                    label: 'Ürün Ekle',
                    primary: true,
                  },
                  onBulkUpdateTrigger && {
                    id: 'bulk',
                    icon: globalIcons.bulkPrice,
                    action: onBulkUpdateTrigger,
                    label: 'Toplu Fiyat',
                  },
                  {
                    id: 'settings',
                    icon: globalIcons.settings,
                    action: onSettingsTrigger,
                    label: 'Ayarlar',
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
                    onClick={() => handleManagementAction(btn.action)}
                    icon={btn.icon}
                    variant={btn.primary ? 'primary' : 'secondary'}
                    size="sm"
                    mode="circle"
                    className={`shrink-0 ${btn.className || ''}`}
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
            icon={globalIcons.adminLayout}
            variant={isMenuExpanded ? 'ghost' : 'secondary'}
            size="sm"
            mode="circle"
            className={
              isMenuExpanded ? menuTheme.toggleActive : menuTheme.toggleInactive
            }
            aria-label={isMenuExpanded ? 'Close Admin Menu' : 'Open Admin Menu'}
          />
        </div>
      </div>
    </div>
  );
}
