import { useState, useCallback } from 'react';
import { LABELS } from '../data/config';

/**
 * USE LOCAL STORAGE HOOK (HAFIZA YÖNETİMİ)
 * --------------------------------------
 * Bir girişimci olarak bu dosya senin "Müşteri Dosyandır".
 * 
 * 1. Kalıcılık: Müşteri sepetini doldurduğunda veya sen admin modunu açtığında, 
 *    sayfa yenilense bile bu bilgilerin kaybolmamasını sağlar.
 * 2. Hata Toleransı: Eğer tarayıcıda bir okuma/yazma hatası olursa sistemi çökertmez, 
 *    güvenli bir şekilde varsayılan değerlere döner.
 * 3. Kapasite Kontrolü: Tarayıcı hafızası dolduğunda (nadir bir durumdur) kullanıcıya 
 *    anlayabileceği dilde uyarı vererek veri kaybını önler.
 */

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  
  // 1. Kurulum: Hafızada bu anahtara (key) ait bir veri var mı kontrol et.
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Varsa getir, yoksa senin belirlediğin başlangıç değerini kullan.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Okuma hatası durumunda girişimci dostu log bas.
      console.warn(LABELS.storage.readError(key), error);
      return initialValue;
    }
  });

  /**
   * setValue: Hem site içindeki bilgiyi (state) hem de tarayıcı hafızasını günceller.
   */
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      // React standardı: Yeni değeri eski değere bakarak hesapla.
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        // Tarayıcı hafızasına (fiziksel disk) yaz.
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // ÖNEMLİ: Eğer hafıza dolmuşsa (QuotaExceededError) kullanıcıyı uyar.
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          console.error(LABELS.storage.quotaExceeded);
          alert(LABELS.storage.quotaAlert);
        }
      }
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}
