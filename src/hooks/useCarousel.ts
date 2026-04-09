import { useLocalStorage } from './useLocalStorage';
import { CAROUSEL, STORAGE } from '../data/config';

/**
 * USE CAROUSEL HOOK (VİTRİN YÖNETİMİ)
 * ----------------------------------
 * Bir girişimci olarak bu dosya senin "Afiş Depondur".
 * 
 * 1. Hafıza Yönetimi: Afişlerde yapılan tüm değişiklikleri (yazı, resim) tarayıcıda saklar.
 * 2. Akıllı Başlangıç: Eğer henüz hiç düzenleme yapmadıysan, 'config.ts'deki varsayılan afişleri yükler.
 * 3. Merkezi Güncelleme: Admin panelinden yapılan bir değişiklikte, sadece ilgili afişi bulur ve günceller (Hız).
 */

interface Slide {
  id: number;
  src: string;
  bg: string;
  label: string;
  sub: string;
}

export function useCarousel() {
  /**
   * useLocalStorage (TEKNİK):
   * Afiş bilgilerini 'STORAGE.carouselSlides' anahtarıyla hafızaya bağlar.
   * Bu sayede admin pencereyi kapatsa da yaptığı afiş düzenlemeleri kaybolmaz.
   */
  const [slides, setSlides] = useLocalStorage<Slide[]>(STORAGE.carouselSlides, CAROUSEL.slides);

  /**
   * updateSlide:
   * @param id - Güncellenecek afişin numarası.
   * @param changes - Değişen kısımlar (Sadece isim, sadece resim vb.)
   * 
   * MANTIK: Mevcut listeyi döner (map), id eşleşirse eski bilgiyi yeniyle harmanlar.
   */
  const updateSlide = (id: number, changes: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    );
  };

  return { slides, updateSlide };
}
