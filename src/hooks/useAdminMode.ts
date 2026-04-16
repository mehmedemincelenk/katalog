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
  const [correctPin, setCorrectPin] = useState('');
  
  const hasFirstClicked = useRef(false);
  const firstClickTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. PIN PRELOAD
  useEffect(() => {
    let isMounted = true;
    async function preload() {
      try {
        const { data } = await supabase.from('stores').select('admin_pin').eq('slug', STORE_SLUG).single();
        if (isMounted && data?.admin_pin) setCorrectPin(data.admin_pin);
      } catch (e) {
        console.error("PIN preload error:", e);
      }
    }
    preload();
    return () => { isMounted = false; };
  }, []);

  // 2. LOGOUT
  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(STORAGE.adminSession);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  }, []);

  // 3. TIMEOUT
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

  // 4. TRIGGER: 1 Click -> Release -> Press and Hold
  const handleLogoPointerDown = useCallback(() => {
    if (isAdmin) return;

    if (!hasFirstClicked.current) {
      // First click start
      hasFirstClicked.current = true;
      if (firstClickTimer.current) clearTimeout(firstClickTimer.current);
      
      // If no second press within 1s, reset
      firstClickTimer.current = setTimeout(() => {
        hasFirstClicked.current = false;
      }, 1000);
    } else {
      // This is the second press (the hold phase)
      if (firstClickTimer.current) clearTimeout(firstClickTimer.current);
      
      longPressTimer.current = setTimeout(() => {
        setIsPinModalOpen(true);
        hasFirstClicked.current = false;
      }, 1000); // 1 second hold is enough for professional feel
    }
  }, [isAdmin]);

  const handleLogoPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
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
    correctPin, 
    onPinSuccess 
  };
}
