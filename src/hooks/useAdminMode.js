import { useState, useCallback } from 'react';
import { ADMIN } from '../data/config';

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [timerId, setTimerId] = useState(null);

  const handleLogoClick = useCallback(() => {
    // If already in admin mode, one click exits
    if (isAdmin) {
      setIsAdmin(false);
      setClickCount(0);
      if (timerId) clearTimeout(timerId);
      return;
    }

    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= ADMIN.triggerClicks) {
        setIsAdmin(true);
        return 0;
      }
      return next;
    });

    // Reset counter if no new click within resetDelayMs
    if (timerId) clearTimeout(timerId);
    const id = setTimeout(() => setClickCount(0), ADMIN.resetDelayMs);
    setTimerId(id);
  }, [timerId, isAdmin]);

  return { isAdmin, handleLogoClick };
}
