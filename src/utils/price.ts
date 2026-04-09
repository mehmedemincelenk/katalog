/**
 * price.ts — HESAP MAKİNESİ (Utility)
 * Sitedeki fiyat ve indirim hesaplamalarını yapan yardımcı araçlar.
 */

/**
 * parsePrice: "₺150,50" gibi bir metni matematiksel sayıya (150.5) çevirir.
 * Bu sayede üzerinde toplama/çıkarma/indirim işlemi yapabiliriz.
 */
export const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  // Sadece rakamları, virgülü ve noktayı al, virgülü noktaya çevir (JS standardı)
  const cleaned = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

/**
 * formatPrice: Sayıyı tekrar "₺150,00" formatına (Türk Lirası görünümü) çevirir.
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * calculateDiscount: Ürünün fiyatına indirim oranını uygular ve sonucu formatlar.
 */
export const calculateDiscount = (price: string, rate: number): string => {
  const original = parsePrice(price);
  if (original === 0) return price;
  // İndirimli fiyat = Orijinal * (1 - %indirim)
  const discounted = original * (1 - rate);
  return formatPrice(discounted);
};
