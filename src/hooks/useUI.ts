import { useEffect, useCallback, useRef } from 'react';
import { CompanySettings } from '../types';

/**
 * UI INTERACTION & LAYOUT HOOKS (DIAMOND HUB)
 * -----------------------------------------------------------
 * Orchestrates accessibility, keyboard shortcuts, system-level metadata,
 * and layout protections (scroll locking).
 */

/**
 * useScrollLock: Locks body scroll and prevents layout shift by compensating for scrollbar width.
 */
export function useScrollLock(lock: boolean) {
  const lockScroll = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '0px';
  }, []);

  useEffect(() => {
    if (lock) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [lock, lockScroll, unlockScroll]);
}

/**
 * useKeyboard: Listens for specific keyboard events to trigger UI actions.
 */
export function useKeyboard(key: string, callback: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) callback();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, enabled]);
}

/**
 * useFocusTrap: Traps keyboard focus within a target element for accessibility.
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, active: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      if (previousFocusRef.current) previousFocusRef.current.focus();
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    const focusTimeout = setTimeout(() => {
      if (containerRef.current) {
        const focusable = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) (focusable[0] as HTMLElement).focus();
      }
    }, 50);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);
    };
  }, [active, containerRef]);
}

/**
 * useSyncMetadata: Synchronizes Browser Tab Title and Favicon based on settings.
 */
export function useSyncMetadata(settings: CompanySettings | null, isAdmin: boolean) {
  useEffect(() => {
    if (!settings || !settings.id) return;
    const baseTitle = settings.title || 'E-Katalog';
    document.title = isAdmin ? `[Admin] ${baseTitle}` : baseTitle;

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (settings.logoUrl) link.href = settings.logoUrl;
  }, [isAdmin, settings]);
}
