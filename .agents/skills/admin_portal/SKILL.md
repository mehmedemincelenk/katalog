---
name: admin_portal
description: Gizli admin modunu ve GDD uyumlu ürün ekleme modalını yönetir.
---
# Admin Portal Becerisi
1. **Secret Trigger:** 7 ardışık tıklama ile `isAdmin` state'ini yönet.
2. **Yeni Ürün Modalı (GDD Uyumlu):** Sağ alt köşedeki "+" butonu şu 4 alanı içeren modalı açar:
     - Ürün Adı (Text)
     - Fiyat (Text/Number)
     - Kategori (Text - Yeni kategori girilirse chip listesine eklenir)
     - Ürün Görseli (File Upload)
3. **Hızlı Kayıt:** Modal onaylandığında ürün anında listeye dahil edilir ve UI güncellenir.