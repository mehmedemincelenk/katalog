---
trigger: always_on
---

---
name: interaction-rules
description: Admin etkileşimleri ve Google Sheets senkronizasyon kuralları.
---
# ETKİLEŞİM VE UI KURALLARI

## 1. Hızlı Düzenleme (In-place Edit)
- Admin modunda bir ürünün **Adına, Fiyatına veya Kategori Etiketine** tıklandığında alan doğrudan düzenlenebilir hale gelmelidir (`contentEditable`).
- Resme tıklandığında cihazın yerel dosya seçicisi açılır. Seçilen görsel `250px`'e sıkıştırılarak base64'e çevrilir ve Sheets'e gönderilir.

## 2. Senkronizasyon ve Onay
- Ürün silme ve arşivleme işlemleri 3-nokta popover menüsünden yapılır.
- `window.confirm` ile onay alınır.
- Her değişiklik arka planda Google Sheets `UPDATE`, `DELETE` veya `RENAME` aksiyonlarını tetikler.

## 3. Dinamik Kategoriler
- Ürünlerden taranan benzersiz kategoriler, Google Sheet'teki `categories` sayfasına göre sıralanır.
- **Emoji Sistemi Kaldırılmıştır.** Sadece metin bazlı kategori butonları kullanılır.

## 4. Arama Davranışı
- Aramalar gerçek zamanlıdır.
- 3 karakterden uzun ve 2 saniye boyunca değişmeyen arama terimleri `search_logs` sayfasına tarihle beraber kaydedilir (Debounce log).
