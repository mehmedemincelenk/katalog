import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * MAIN.TSX (PROJE ATEŞLEME NOKTASI)
 * --------------------------------
 * Bir kurucu olarak bu dosya senin "Ana Şalterin"dir.
 * 
 * 1. Hayata Geçiş: Yazdığımız binlerce satır kodun, internet tarayıcısındaki o boş beyaz 
 *    sayfaya (index.html) ilk temas ettiği ve canlandığı yer burasıdır.
 * 2. Sistemsel Koruma (StrictMode): Uygulamanı sürekli denetleyen görünmez bir "Kalite Kontrolcü" 
 *    devreye sokar. Hatalı bir kod yazıldığında seni uyarır.
 * 3. Tek Giriş İlkesi: Uygulamanın tüm karmaşıklığı burada 'App' bileşeni altında toplanır 
 *    ve tarayıcıya "Bunu göster" talimatı verilir.
 */

// Tarayıcıdaki 'root' isimli boş kutuyu bul ve React motorunu içine yerleştir.
createRoot(document.getElementById('root')!).render(
  // <StrictMode>: Geliştirme sürecinde "sigorta" görevi görür, hataları erkenden yakalar.
  <StrictMode>
    <App />
  </StrictMode>,
);
