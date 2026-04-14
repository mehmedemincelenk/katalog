import { useState, useEffect, useRef, useCallback } from 'react';
import { THEME } from '../data/config';
import Button from './Button';

/**
 * FLOATING ADMIN MENU COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * AssistiveTouch-style management hub. Fully managed via central THEME.
 */

interface FloatingAdminMenuProps {
  onAdminLogout: () => void;
  onProductAddTrigger: () => void;
}

export default function FloatingAdminMenu({ 
  onAdminLogout, 
  onProductAddTrigger 
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
    <div className={menuTheme.wrapper} ref={menuContainerRef}>
      <div className={menuTheme.container}>
        
        {/* EXPANDABLE ACTION AREA */}
        <div className={`
          ${menuTheme.innerActions} 
          ${isMenuExpanded ? menuTheme.actionsActive : menuTheme.actionsInactive}
        `}>
          <Button 
            onClick={() => handleManagementAction(onAdminLogout)}
            icon={globalIcons.power}
            variant="danger"
            size="sm"
            mode="circle"
            aria-label="Logout"
          />

          <Button 
            onClick={() => handleManagementAction(onProductAddTrigger)}
            icon={globalIcons.plus}
            variant="primary"
            size="sm"
            mode="circle"
            aria-label="Add New Product"
          />
        </div>

        {/* MAIN TOGGLE CONTROL */}
        <Button 
          onClick={() => { clearAutoCloseTimer(); setIsMenuExpanded(previousState => !previousState); }}
          icon={isMenuExpanded ? globalIcons.close : globalIcons.adminLayout}
          variant={isMenuExpanded ? 'ghost' : 'secondary'}
          size="sm"
          mode="circle"
          className={isMenuExpanded ? menuTheme.toggleActive : menuTheme.toggleInactive}
          aria-label={isMenuExpanded ? "Close Admin Menu" : "Open Admin Menu"}
        />
      </div>
    </div>
  );
}
