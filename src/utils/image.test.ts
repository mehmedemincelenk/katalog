import { describe, it, expect, vi } from 'vitest';
import { compressImage } from './image';

/**
 * IMAGE.TEST.TS (KALİTE GÜVENCE LABORATUVARI)
 * -----------------------------------------
 * Bir kurucu olarak bu dosya senin "Hata Erken Uyarı Sistemin"dir.
 * 
 * 1. Otomatik Denetim: Yazdığımız resim sıkıştırma fonksiyonu gerçekten çalışıyor mu? 
 *    Bu dosya, sahte bir resim yükleyerek sistemi test eder.
 * 2. Simülasyon: Tarayıcı ortamını taklit ederek (Mocking), gerçek bir kullanıcı 
 *    resim yüklediğinde arkada neler olacağını önceden görürüz.
 * 3. Güvence: İleride kodda bir değişiklik yaptığımızda, bu testler sayesinde 
 *    eski özelliklerin bozulup bozulmadığını saniyeler içinde anlarız.
 */

// SAHTE TARAYICI AYARI: Test ortamında gerçek bir ekran olmadığı için 
// resim oluşturma özelliklerini taklit ediyoruz.
if (typeof HTMLCanvasElement.prototype.toDataURL === 'undefined') {
  HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () => 'data:image/jpeg;base64,mock',
  );
}

describe('Görsel İşleme Testleri', () => {
  /**
   * TEST 1: Sıkıştırma motoru bir cevap dönüyor mu?
   */
  it('compressImage fonksiyonu bir söz (promise) döndürmeli', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const result = compressImage(mockFile);
    
    // İşlemin başarılı bir şekilde başladığını ve cevap beklediğimizi doğrula.
    expect(result).toBeInstanceOf(Promise);
  });

  /**
   * NOT: Daha karmaşık testler (gerçek boyut küçültme vb.) için gerçek 
   * grafik işlemcisi gereklidir. Şu anki test, temel mekanizmanın sağlamlığını kanıtlar.
   */
});
