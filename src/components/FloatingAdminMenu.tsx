// FILE: src/components/FloatingAdminMenu.tsx
// ROLE: Renders an assistive-touch style floating action button (FAB) for global admin commands
// READS FROM: src/data/config
// USED BY: App.tsx (when admin mode is active)

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../data/config';
import Button from './Button';

/**
 * FLOATING ADMIN MENU COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * AssistiveTouch-style management hub. Fully managed via central THEME.
 */

interface FloatingAdminMenuProps {
  onProductAddTrigger: () => void;
  onBulkUpdateTrigger?: () => void;
  onSettingsTrigger: () => void;
}

// ARCHITECTURE: FloatingAdminMenu
// PURPOSE: Provides quick access to add products, bulk edit prices, and toggle display settings while browsing the catalog
// DEPENDENCIES: THEME.floatingAdminMenu, framer-motion
// CONSUMERS: App layout layer
export default function FloatingAdminMenu({ 
  onProductAddTrigger,
  onBulkUpdateTrigger,
  onSettingsTrigger
}: FloatingAdminMenuProps) {
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
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setIsMenuExpanded(false);
      }
    };

    if (isMenuExpanded) {
      document.addEventListener('pointerdown', handlePointerDownOutside);
      clearAutoCloseTimer();
      // Auto-close after 3 seconds of inactivity
      autoCloseTimerRef.current = setTimeout(() => setIsMenuExpanded(false), 3000);
    } else {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      clearAutoCloseTimer();
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      clearAutoCloseTimer();
    };
  }, [isMenuExpanded, clearAutoCloseTimer]);

  const handleManagementAction = (actionCallback: () => void) => {
    clearAutoCloseTimer();
    actionCallback();
    setIsMenuExpanded(false);
  };

  return (
    <div ref={menuContainerRef}>
      <div className={`${menuTheme.container} overflow-hidden w-[46px] flex flex-col items-center justify-end`}>
        
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
                  height: "auto",
                  opacity: 1,
                  marginBottom: 8, // Spacing only when open
                  transition: {
                    height: { type: "spring", stiffness: 300, damping: 30 },
                    staggerChildren: 0.05,
                    delayChildren: 0.1
                  }
                },
                closed: {
                  height: 0,
                  opacity: 0,
                  marginBottom: 0,
                  transition: {
                    height: { type: "spring", stiffness: 300, damping: 35 },
                    staggerChildren: 0.03,
                    staggerDirection: -1
                  }
                }
              }}
              className="flex flex-col gap-2 items-center w-full"
              style={{ transformOrigin: 'bottom' }}
            >
              {(
                [
                  { 
                    id: 'add', 
                    icon: globalIcons.plus, 
                    action: onProductAddTrigger,
                    label: "Ürün Ekle",
                    primary: true
                  },
                  onBulkUpdateTrigger && { 
                    id: 'bulk', 
                    icon: globalIcons.bulkPrice, 
                    action: onBulkUpdateTrigger,
                    label: "Toplu Fiyat" 
                  },
                  { 
                    id: 'settings', 
                    icon: globalIcons.settings, 
                    action: onSettingsTrigger,
                    label: "Ayarlar" 
                  }
                ].filter(Boolean) as { id: string; icon: React.ReactNode; action: () => void; label: string; primary?: boolean; className?: string }[]
              ).map((btn) => (
                <motion.div
                  key={btn.id}
                  variants={{
                    open: { opacity: 1, y: 0, scale: 1 },
                    closed: { opacity: 0, y: 15, scale: 0.5 }
                  }}
                  className="w-full flex justify-center"
                >
                  <Button 
                    onClick={() => handleManagementAction(btn.action)}
                    icon={btn.icon}
                    variant={btn.primary ? "primary" : "secondary"}
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
            onClick={() => { clearAutoCloseTimer(); setIsMenuExpanded(previousState => !previousState); }}
            icon={globalIcons.adminLayout}
            variant={isMenuExpanded ? 'ghost' : 'secondary'}
            size="sm"
            mode="circle"
            className={isMenuExpanded ? menuTheme.toggleActive : menuTheme.toggleInactive}
            aria-label={isMenuExpanded ? "Close Admin Menu" : "Open Admin Menu"}
          />
        </div>
      </div>
    </div>
  );
}
