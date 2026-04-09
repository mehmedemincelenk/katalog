/**
 * IMAGE.TS (RESİM ATÖLYESİ VE OPTİMİZASYON)
 * ---------------------------------------
 * Bir kurucu olarak bu dosya senin "Kalite Kontrol ve Tasarruf" departmanındır.
 * 
 * 1. Verimlilik: Google Sheets'in hücre başına 32.767 karakter sınırı vardır. Bu dosya, 
 *    yüklediğin resimleri bu sınıra sığacak şekilde otomatik olarak küçültür ve sıkıştırır.
 * 2. Akıllı Yönetim: Resim çok büyükse kalitesini kademeli olarak düşürür, hala sığmıyorsa 
 *    boyutunu yarıya indirerek her koşulda Sheets'e kaydedilmesini sağlar.
 * 3. Hız ve Tasarruf: Küçültülmüş resimler sayesinde müşterilerin sitesi çok daha hızlı açılır 
 *    ve internet paketlerinden daha az yer.
 */

import { TECH } from '../data/config';

/**
 * getImageUrl: Verilen yolu kontrol eder ve geçerli bir internet adresi döndürür.
 * Base64 (yüklenen) resimleri olduğu gibi, yerel dosyaları ise tam yoluyla hazırlar.
 */
export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Sitenin çalıştığı ana klasörü (base url) alıp yolu temizler.
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Resim olmayan ürünlerde görünecek varsayılan sembol.
export const PLACEHOLDER_EMOJI = TECH.image.placeholderEmoji;

/**
 * fileToImage: Ham dosyayı (file) sistemin işleyebileceği bir resim nesnesine çevirir.
 */
const fileToImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Resim dosyası açılamadı.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okuma hatası.'));
    reader.readAsDataURL(file);
  });
};

/**
 * compressImage: ANA SIKIŞTIRMA MOTORU
 * @param file - Yüklenen ham resim dosyası.
 * @param maxSize - Hedef genişlik (piksel).
 * @param quality - Hedef kalite (0.1 - 1.0 arası).
 */
export async function compressImage(
  file: File,
  maxSize = TECH.image.productSize,
  quality = TECH.image.quality,
): Promise<string> {
  const img = await fileToImage(file);
  const canvas = document.createElement('canvas');
  let { width, height } = img;

  // BOYUT HESAPLAMA: Resim çok genişse veya çok yüksekse orantılı olarak küçült.
  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Grafik işlemcisi başlatılamadı.');

  // Saydam (transparent) resimlerde siyah leke kalmaması için beyaz zemin atıyoruz.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // İlk deneme: Belirlenen kalitede kaydet.
  let dataUrl = canvas.toDataURL('image/jpeg', quality);

  // KONTROL 1: Karakter sınırı tehlikeye giriyorsa (30k+), kaliteyi düşür.
  if (dataUrl.length > TECH.image.charLimitWarning) {
    dataUrl = canvas.toDataURL('image/jpeg', TECH.image.qualityFallback);
  }

  // KONTROL 2 (KRİTİK): Hala sığmıyorsa (32k+), boyutu yarıya indir ve kaliteyi en dibe çek.
  if (dataUrl.length > TECH.image.sheetCellLimit) {
    canvas.width = Math.round(width / 2);
    canvas.height = Math.round(height / 2);
    const ctx2 = canvas.getContext('2d');
    if (ctx2) {
      ctx2.fillStyle = '#FFFFFF';
      ctx2.fillRect(0, 0, canvas.width, canvas.height);
      ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL('image/jpeg', TECH.image.criticalQualityFallback);
    }
  }

  return dataUrl;
}
