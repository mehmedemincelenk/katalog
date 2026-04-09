import { useState, useCallback, useRef, useEffect } from 'react';
import { TECH, LABELS } from '../data/config';

export type ActiveDiscount = {
  code: string;
  rate: number;
};

/**
 * USE DISCOUNT HOOK (AVANTAJ YÖNETİMİ)
 * ----------------------------------
 * Bir girişimci olarak bu dosya senin "Müşteri Sadakat" motorundur.
 * 
 * 1. Dinamik Kurgu: Sabit kuponlar yerine, kodun sonuna eklenen sayı kadar indirim yapar (Örn: HOŞGELDİN10 -> %10).
 * 2. Güvenlik: İndirim oranlarını 'config.ts'deki sınırlar (TECH.discount.min/max) içinde tutar.
 * 3. Kullanıcı Geri Bildirimi: Hatalı girişlerde (yazı girilmesi, aşırı oran vb.) şık hata mesajları üretir.
 */
export function useDiscount() {
  const [activeDiscount, setActiveDiscount] = useState<ActiveDiscount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Temizlik: Bileşen kapandığında arka planda çalışan hata zamanlayıcısını durdurur.
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  /**
   * applyCode: Girilen metni analiz eder ve indirim uygular.
   * @param input - Müşterinin yazdığı kupon metni.
   */
  const applyCode = useCallback((input: string) => {
    const code = input.toUpperCase().trim();
    
    // Varsa eski hata zamanlayıcısını iptal et.
    if (timerRef.current) clearTimeout(timerRef.current);

    // Boş giriş yapıldıysa her şeyi sıfırla.
    if (!code) {
      setActiveDiscount(null);
      setError(null);
      return;
    }

    // REGEX: Yazının sonundaki rakamları ayıkla.
    const match = code.match(/(\d+)$/);

    if (match && match[1]) {
      const discountPercent = parseInt(match[1], 10);

      // Oran Kontrolü: Belirlediğin sınırlar dışındaysa hata ver.
      if (discountPercent >= TECH.discount.min && discountPercent <= TECH.discount.max) {
        setActiveDiscount({ code, rate: discountPercent / 100 });
        setError(null);
      } else {
        setActiveDiscount(null);
        setError(LABELS.discount.invalidRate);
        // Hatayı 3 saniye sonra ekrandan kaldır.
        timerRef.current = setTimeout(() => setError(null), TECH.discount.errorResetMs);
      }
    } else {
      // Rakam içermeyen girişler geçersiz sayılır.
      setActiveDiscount(null);
      setError(LABELS.discount.invalidCode);
      timerRef.current = setTimeout(() => setError(null), TECH.discount.errorResetMs);
    }
  }, []);

  return { activeDiscount, applyCode, error };
}
