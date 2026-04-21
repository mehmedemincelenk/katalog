// FILE: src/hooks/useAdminMode.ts
// ROLE: Manages admin session state, PIN verification, auto-logout, and complex gesture detection for admin entry
// READS FROM: src/data/config, src/lib/supabase, src/utils/store
// USED BY: App.tsx, Navbar, admin-restricted components

import { useState, useCallback, useRef, useEffect } from 'react';
import { TECH, STORAGE } from '../data/config';
import { supabase } from '../lib/supabase';
import { getActiveStoreSlug } from '../utils/store';

const STORE_SLUG = getActiveStoreSlug();

/**
 * ADMIN SESSION & GESTURE ENGINE (Diamond Standard)
 * -----------------------------------------------------------
 * Güvenlik ve gizli geçitlerin yönetim merkezi.
 * - Admin oturumu yönetimi.
 * - Akıllı Gesture Algılama (PIN vs QR Ayrımı).
 * - Sunucu taraflı PIN doğrulama (RPC).
 */

// ARCHITECTURE: useAdminMode
// PURPOSE: Handles the entire admin lifecycle including login/logout logic, UI gesture triggers, and brute-force protection
// DEPENDENCIES: supabase (for 'verify_admin_access' RPC), getActiveStoreSlug
// CONSUMERS: Top-level App components or providers needing admin state and functions
export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(STORAGE.adminSession) === TECH.auth.sessionActiveValue;
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  // UX PREFERENCE: Local state for editing mode
  const [isInlineEnabled, setIsInlineEnabled] = useState(() => {
    const saved = localStorage.getItem('ekatalog_inline_edit_v1');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleInlineEdit = useCallback(() => {
    setIsInlineEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('ekatalog_inline_edit_v1', String(newVal));
      return newVal;
    });
  }, []);
  
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('admin_lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });
  const [isLockedOut, setIsLockedOut] = useState(() => {
    return !!lockoutUntil && Date.now() < lockoutUntil;
  });
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Check for lockout expiry
  useEffect(() => {
    if (!lockoutUntil) return;

    const check = setInterval(() => {
      const isStillLocked = Date.now() < lockoutUntil;
      if (!isStillLocked) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        sessionStorage.removeItem('admin_lockout_until');
        setIsLockedOut(false);
        clearInterval(check);
      } else {
        setIsLockedOut(true);
      }
    }, 1000);
    return () => clearInterval(check);
  }, [lockoutUntil]);

  const verifyPinWithServer = useCallback(async (pin: string) => {
    if (STORE_SLUG === 'main-site') return false;
    
    if (isLockedOut) return false;
    
    const { data: isSuccess, error } = await supabase
      .rpc('verify_admin_access', { 
        target_slug: STORE_SLUG, 
        input_pin: pin 
      });
    
    if (error) {
      console.error('❌ PIN doğrulama hatası:', error);
      return false;
    }

    if (!isSuccess) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        const until = Date.now() + 60000;
        setLockoutUntil(until);
        sessionStorage.setItem('admin_lockout_until', String(until));
        setIsLockedOut(true);
      }
    } else {
      setFailedAttempts(0);
      setIsLockedOut(false);
    }
    
    return isSuccess;
  }, [failedAttempts, isLockedOut, STORE_SLUG]);

  // GESTURE ENGINE REFS
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCountTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef(0);
  const pointerDownTime = useRef(0);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  // LOGOUT
  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(STORAGE.adminSession);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  }, []);

  // SESSION TIMEOUT
  const resetTimeout = useCallback(() => {
    if (!isAdmin) return;
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    timeoutTimer.current = setTimeout(logout, TECH.auth.timeoutMs);
  }, [isAdmin, logout]);

  useEffect(() => {
    if (!isAdmin) return;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimeout();
    events.forEach(name => document.addEventListener(name, handleActivity));
    resetTimeout();
    return () => {
      events.forEach(name => document.removeEventListener(name, handleActivity));
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [isAdmin, resetTimeout]);

  // SMART TRIGGER LOGIC: 
  // 1. Long Press (1.5s) -> Admin PIN / Logout
  // 2. Click then within 1s Long Press (0.8s) -> QR Modal
  const handleLogoPointerDown = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    pointerDownTime.current = Date.now();
    
    const isComboAttempt = clickCount.current === 1;

    longPressTimer.current = setTimeout(() => {
      if (isComboAttempt) {
        setIsQRModalOpen(true);
        clickCount.current = 0; // Combo consumed
      } else {
        if (isAdmin) logout();
        else setIsPinModalOpen(true);
      }
    }, isComboAttempt ? 800 : 1500); 
  }, [isAdmin, logout]);

  const handleLogoPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const holdDuration = Date.now() - pointerDownTime.current;

    // RULE: Only increment click context if it was a quick "short" press (Diamond UI Standard)
    // If user held for Logout (1.5s), it clearly shouldn't count as first half of QR combo.
    if (holdDuration < 300) {
      clickCount.current += 1;
      if (clickCountTimer.current) clearTimeout(clickCountTimer.current);
      
      clickCountTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 1000); // 1 second window for the combo
    } else {
      // Long hold happened (Admin entry/exit), reset any ongoing combo context for hygiene
      clickCount.current = 0;
      if (clickCountTimer.current) clearTimeout(clickCountTimer.current);
    }
  }, []);

  const onPinSuccess = useCallback(() => {
    setIsAdmin(true);
    sessionStorage.setItem(STORAGE.adminSession, TECH.auth.sessionActiveValue);
    setIsPinModalOpen(false);
    // Reset click counts for hygiene
    clickCount.current = 0;
  }, []);

  return { 
    isAdmin, 
    handleLogoPointerDown, 
    handleLogoPointerUp,
    logout, 
    isPinModalOpen, 
    setIsPinModalOpen, 
    isQRModalOpen,
    setIsQRModalOpen,
    verifyPinWithServer, 
    onPinSuccess,
    isInlineEnabled,
    toggleInlineEdit,
    isLockedOut,
    failedAttempts
  };
}
