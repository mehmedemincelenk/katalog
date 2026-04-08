import { useState, useEffect, useCallback } from 'react';
import { ADMIN } from '../data/config';

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Sayfa yüklendiğinde session kontrolü
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session) setIsAdmin(true);
  }, []);

  const handleLogoClick = useCallback(() => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= ADMIN.triggerClicks) {
        setIsAdmin(true);
        localStorage.setItem('admin_session', 'active_' + Date.now());
        return 0;
      }
      return newCount;
    });

    // Tıklama arası çok uzarsa sayacı sıfırla
    const timeout = setTimeout(() => setClickCount(0), ADMIN.resetDelayMs);
    return () => clearTimeout(timeout);
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem('admin_session');
    setClickCount(0);
  }, []);

  return { isAdmin, handleLogoClick, logout };
}
