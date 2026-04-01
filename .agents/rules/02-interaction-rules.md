---
trigger: always_on
---

---
name: interaction-rules
description: Admin etkileşimleri ve yerinde düzenleme kuralları.
---
# ETKİLEŞİM VE UI KURALLARI

## 1. Hızlı Düzenleme (In-place Edit)
- Admin modunda bir ürünün **Adına, Fiyatına veya Kategori Etiketine** tıklandığında alan düzenlenebilir hale gelmelidir.
- Resme tıklandığında cihazın yerel dosya seçicisi açılır.

## 2. Silme Etkileşimi (Double-Tap)
- **Zon Kısıtlaması:** Silme tetikleyicisi sadece ürün kartının içerik/metin alanında çalışmalıdır; resim alanında çalışmamalıdır.
- Mobilde 300ms içinde çift dokunuş, PC'de çift tıklama ile silme tetiklenir.
- `window.confirm` ile onay alınır.

## 3. Dinamik Kategoriler
- Ürünlerden taranan kategoriler "Tümü" chip'inden sonra alfabetik sıralanarak ekrana basılır.