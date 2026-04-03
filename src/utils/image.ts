// K.I.S.S. Akıllı Resim Sıkıştırma (Google Sheets Uyumlu)
// Google Sheets hücre sınırı: 32.767 karakter.
// Bu fonksiyon, resmin hem boyutunu hem de kalitesini bu sınıra göre otomatik ayarlar.

/**
 * compressImage
 *
 * Dosyayı alır, belirtilen boyut ve kalitede Base64 formatına dönüştürür.
 * Google Sheets hücre sınırına (32KB) takılmaması için otomatik olarak boyut düşürür.
 *
 * @param {File} file - İşlenecek resim dosyası
 * @param {number} maxSize - Maksimum genişlik veya yükseklik (piksel)
 * @param {number} quality - Sıkıştırma kalitesi (0.1 - 1.0 arası)
 *
 * @returns {Promise<string>} Sıkıştırılmış resmin Base64 formatındaki URL'si
 */
export function compressImage(file, maxSize = 250, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 400x400 civarı bir boyut hem netlik hem de veri tasarrufu için idealdir.
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

        // Beyaz zemin (Saydamlık hatalarını önler)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        // İlk deneme (varsayılan kaliteyle)
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Eğer hala 30.000 karakterden büyükse (Google Sheets sınırı 32k), kaliteyi daha da düşür
        if (dataUrl.length > 30000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.4);
        }

        // Kritik kontrol: Hala büyükse boyutu yarıya indir (En son çare)
        if (dataUrl.length > 32000) {
          canvas.width = Math.round(width / 2);
          canvas.height = Math.round(height / 2);
          const ctx2 = canvas.getContext('2d');
          ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.3);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Resim işlenemedi.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}
