import { useState, useEffect, useCallback, useRef } from 'react';
import { TECH, STORAGE } from '../data/config';

/**
 * USE ADMIN MODE HOOK (GÜVENLİK VE YETKİ)
 * --------------------------------------
 * Bir girişimci olarak bu dosya senin "Dijital Anahtarındır".
 * 
 * 1. Gizli Giriş: Şifre ekranı yerine, logonun üzerine belirlenen sayıda (Config: TECH.adminTriggerClicks) 
 *    tıklayarak mağaza yönetimini açmanı sağlar.
 * 2. Oturum Hafızası: Admin modunu bir kez açtığında, tarayıcıyı kapatsan bile 'STORAGE.adminSession' 
 *    sayesinde sistem seni tanımaya devam eder.
 * 3. Akıllı Sıfırlama: Tıklamalar arasında çok uzun süre geçerse (Config: TECH.adminResetDelay), 
 *    mağaza güvenliği için sayacı otomatik sıfırlar.
 */
export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Oturum Kontrolü: Mağaza açıldığında "Anahtar bende mi?" diye hafızaya bak.
  useEffect(() => {
    const session = localStorage.getItem(STORAGE.adminSession);
    if (session) setIsAdmin(true);
  }, []);

  /**
   * handleLogoClick (GİZLİ KAPI):
   * Her logoya tıklandığında tetiklenir.
   */
  const handleLogoClick = useCallback(() => {
    // Varsa eski sıfırlama zamanlayıcısını iptal et.
    if (timerRef.current) clearTimeout(timerRef.current);

    setClickCount((prev) => {
      const newCount = prev + 1;
      // Hedef tıklama sayısına ulaşıldı mı?
      if (newCount >= TECH.adminTriggerClicks) {
        setIsAdmin(true);
        // Hafızaya "Admin içeride" notu düş.
        localStorage.setItem(STORAGE.adminSession, 'active_' + Date.now());
        return 0;
      }
      return newCount;
    });

    // Belirlenen süre içinde tekrar tıklanmazsa sayacı temizle (Güvenlik Kuralı).
    timerRef.current = setTimeout(() => {
      setClickCount(0);
    }, TECH.adminResetDelay);
  }, []);

  /**
   * logout (KİLİTLEME):
   * Admin modunu kapatır ve anahtarı çöpe atar.
   */
  const logout = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAdmin(false);
    localStorage.removeItem(STORAGE.adminSession);
    setClickCount(0);
  }, []);

  return { isAdmin, handleLogoClick, logout };
}
