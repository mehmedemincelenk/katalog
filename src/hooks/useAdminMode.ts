import { useState, useCallback, useRef, useEffect } from 'react';
import { TECH, STORAGE, LABELS } from '../data/config';
import { supabase } from '../lib/supabase';

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(STORAGE.adminSession) === TECH.auth.sessionActiveValue;
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [correctPin, setCorrectPin] = useState('');
  
  const clickCount = useRef(0);
  const timer = useRef<any>(null);

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

  const handleLogoClick = useCallback(() => {
    if (isAdmin) return;

    clickCount.current += 1;
    console.log(`🔑 Giriş Denemesi: ${clickCount.current}/3`); 

    if (timer.current) clearTimeout(timer.current);
    
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setIsPinModalOpen(true);
    }

    timer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 3000); 
  }, [isAdmin]);

  const onPinSuccess = useCallback(() => {
    setIsAdmin(true);
    sessionStorage.setItem(STORAGE.adminSession, TECH.auth.sessionActiveValue);
    setIsPinModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(STORAGE.adminSession);
  }, []);

  return { 
    isAdmin, 
    handleLogoClick, 
    logout, 
    isPinModalOpen, 
    setIsPinModalOpen, 
    correctPin, 
    onPinSuccess 
  };
}
