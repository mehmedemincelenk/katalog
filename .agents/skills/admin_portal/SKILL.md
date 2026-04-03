---
name: admin_portal
description: Google Sheets senkronizasyonlu admin modunu ve görsel yönetimini yönetir.
---
# Admin Portal Becerisi

## 1. Giriş ve Görünüm
- Footer logosuna 7 kez tıklanarak açılır.
- Admin modu aktifken ürün kartlarında "Kategori" etiketi ve "Aksiyon (3-nokta)" menüsü görünür.

## 2. Google Sheets Senkronizasyonu
Yapılan her işlem arka planda `syncWithSheet` fonksiyonunu tetikler:
- **Ürün Ekleme:** `ADD` aksiyonu ile Sheet'e yeni satır ekler.
- **Düzenleme:** `UPDATE` aksiyonu ile hücre bazlı güncelleme yapar.
- **Kategori İsmi Değiştirme:** `RENAME_CATEGORY` aksiyonu ile tüm ilgili ürünleri toplu günceller.
- **Kategori Sıralama:** Sürükle-bırak sonrası `UPDATE_CATEGORY_ORDER` ile `categories` sayfasını yeniler.

## 3. Görsel Optimizasyonu (Kritik)
Google Sheets hücre sınırı (32KB) nedeniyle görseller:
- `maxSize: 250px`
- `quality: 0.6`
değerleriyle sıkıştırılmalıdır. Bu işlem `src/utils/image.js` tarafından otomatik yönetilir.

## 4. In-Place Editing
- Admin modunda isim ve fiyat alanları `contentEditable` ile anında düzenlenir.
- `onBlur` anında Sheets senkronizasyonu başlar.
