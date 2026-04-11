import { useState, useCallback, useRef } from 'react';
import { TECH, STORAGE } from '../data/config';
import { supabase } from '../lib/supabase';

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    const session = localStorage.getItem(STORAGE.adminSession);
    return !!session;
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [correctPin, setCorrectPin] = useState('');

  const clickCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    clickCountRef.current += 1;

    if (clickCountRef.current >= TECH.adminTriggerClicks) {
      clickCountRef.current = 0;
      
      if (isAdmin) return;

      // Supabase'den PIN'i çek
      const { data, error } = await supabase
        .from('stores')
        .select('admin_pin')
        .eq('slug', STORE_SLUG)
        .single();

      if (data && !error && data.admin_pin) {
        setCorrectPin(data.admin_pin);
        setIsPinModalOpen(true);
      } else {
        console.error("PIN not found in database");
      }
    }

    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, TECH.adminResetDelay);
  }, [isAdmin]);

  const onPinSuccess = useCallback(() => {
    setIsAdmin(true);
    localStorage.setItem(STORAGE.adminSession, 'active_' + Date.now());
    setIsPinModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAdmin(false);
    localStorage.removeItem(STORAGE.adminSession);
    clickCountRef.current = 0;
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
