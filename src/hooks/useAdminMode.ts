import { useState, useCallback, useRef, useEffect } from 'react';
import { TECH, STORAGE } from '../data/config';
import { supabase } from '../lib/supabase';
import { getActiveStoreSlug } from '../utils/store';

const STORE_SLUG = getActiveStoreSlug();

/**
 * ADMIN SESSION & GESTURE ENGINE (useAdminMode)
 * -----------------------------------------------------------
 * Bu hook mağazanın kapı görevlisidir:
 * 1. Admin oturum yönetimi (sessionStorage).
 * 2. Gesture Algılama: Logoya uzun basış (1.5s) ile giriş/çıkış.
 * 3. Güvenlik: PIN doğrulama ve hatalı deneme kilidi.
 * 4. UX Tercihleri: 'Vibe Coding' için inline düzenleme modu kontrolü.
 */
export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(STORAGE.adminSession) === TECH.auth.sessionActiveValue;
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  
  // UX PREFERENCE: Local state for editing mode (Inline vs Modal)
  const [isInlineEnabled, setIsInlineEnabled] = useState(() => {
    const saved = localStorage.getItem('ekatalog_inline_edit_v1');
    // Default to true (it's the signature 'vibe coding' experience)
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
    
    if (isLockedOut) {
      console.warn('Security Shield: Rate limited. Please wait.');
      return false;
    }
    
    // SECURE SERVER-SIDE VERIFICATION: Doğrudan tabloyu okumuyoruz, gizli fonksiyonu çağırıyoruz.
    const { data: isSuccess, error } = await supabase
      .rpc('verify_admin_access', { 
        target_slug: STORE_SLUG, 
        input_pin: pin 
      });
    
    if (error) {
      console.error('❌ PIN doğrulama sırasında teknik hata:', error);
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
  }, [failedAttempts, isLockedOut]);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCountTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef(0);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. QR TRIGGER (1 Click + 1 Long Press)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 2. LOGOUT
  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(STORAGE.adminSession);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  }, []);

  // 3. TIMEOUT (Session Security)
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

  // 4. TRIGGER LOGIC: 
  // - 2 Seconds Hold -> Admin (PIN Modal or Logout)
  // - 1 Click + 1 Second Hold -> QR Modal (Easter Egg)
  const handleLogoPointerDown = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    // Check if we are in the middle of a gesture
    const isGestureAction = clickCount.current === 1;

    longPressTimer.current = setTimeout(() => {
      if (isGestureAction) {
        // 1 Click + 0.8 Second Hold -> Open QR
        setIsQRModalOpen(true);
        clickCount.current = 0; // Reset
      } else {
        // 1.5 Seconds Hold -> Admin Login/Logout
        if (isAdmin) {
          logout();
        } else {
          setIsPinModalOpen(true);
        }
      }
    }, isGestureAction ? 800 : 1500); 
  }, [isAdmin, logout]);

  const handleLogoPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle "Click" detection for the next gesture
    clickCount.current += 1;
    if (clickCountTimer.current) clearTimeout(clickCountTimer.current);
    
    // Give more time for the follow-up long press (increased to 800ms)
    clickCountTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 800); 
  }, []);

  const onPinSuccess = useCallback(() => {
    setIsAdmin(true);
    sessionStorage.setItem(STORAGE.adminSession, TECH.auth.sessionActiveValue);
    setIsPinModalOpen(false);
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
