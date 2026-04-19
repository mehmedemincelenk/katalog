import { useState, useCallback, useRef, useEffect } from 'react';
import { TECH, STORAGE } from '../data/config';
import { supabase } from '../lib/supabase';
import { getActiveStoreSlug } from '../utils/store';

const STORE_SLUG = getActiveStoreSlug();

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

  // SECURITY: The PIN is verified directly via Supabase query filters
  const verifyPinWithServer = useCallback(async (pin: string) => {
    if (STORE_SLUG === 'main-site') return false;
    
    // Safety: If locked out, refuse to even call the server
    if (isLockedOut) {
      console.warn('Security Shield: Rate limited. Please wait.');
      return false;
    }
    
    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', STORE_SLUG)
      .eq('admin_pin', pin)
      .single();
    
    const isSuccess = !!data && !error;

    if (!isSuccess) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      // Bot Protection: Block for 60 seconds after 3 fails
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
        // 2 Seconds Hold -> Admin Login/Logout
        if (isAdmin) {
          logout();
        } else {
          setIsPinModalOpen(true);
        }
      }
    }, isGestureAction ? 800 : 2000); 
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
    isLockedOut
  };
}
