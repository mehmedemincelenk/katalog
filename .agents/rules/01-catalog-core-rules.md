---
trigger: always_on
---

---
name: catalog-core-rules
description: B2B Katalog mimarisi ve Google Sheets veri yönetim kuralları.
---
# B2B KATALOG ANAYASASI

## 1. Veri Yönetimi (Google Sheets Integration)
- **Ana Veritabanı:** Google Sheets kullanılır.
- **Okuma:** `.env` dosyasındaki `VITE_SHEET_URL` (CSV) üzerinden yapılır.
- **Yazma:** `.env` dosyasındaki `VITE_SHEET_SCRIPT_URL` (Google Apps Script) üzerinden yapılır.
- **Senkronizasyon:** `products`, `categories` ve `search_logs` sayfaları anlık senkronize edilir.
- **Görsel Sınırı:** Resimler `base64` formatına dönüştürülmeden **önce** mutlaka `250px` boyutuna sıkıştırılmalıdır (Google Sheets 32KB hücre sınırı nedeniyle).

## 2. Merkezi Konfigürasyon (Centralized Config)
- Telefon, adres ve marka bilgileri `src/data/config.js` dosyasında tutulur.
- Kod içinde hiçbir "hard-coded" metin veya sayısal sabit bırakılamaz.

## 3. Admin Toggle Mantığı
- **Giriş:** Footer logosuna 2 saniye içinde 7 kez ardışık tıklama.
- **Çıkış:** Admin modu açıkken footer logosuna 1 kez tıklama.

## 4. Tasarım Dili (Zorunlu)
- **Renk Paleti:** Kraft (Bej/Toprak tonları), Beyaz ve Siyah.
- **Para Birimi:** Fiyatlar daima `₺` simgesiyle gösterilir.

## 5. Sabit UI Bileşenleri
- **Navbar:** Logo, WhatsApp, Telefon ve Adres.
- **Header:** HeroCarousel.
- **Lazy Loading:** Tüm ürün resimleri `loading="lazy"` özniteliğine sahip olmalıdır.
- **Hata Yönetimi:** Veri çekilemezse "Bakım Modu" ekranı (`App.jsx`) gösterilir.

## 6. Veri Semantiği
- **name:** Ürün öz adı.
- **description:** Teknik detaylar (gramaj, adet vb.).
- **is_archived:** Ürünün yayında olup olmadığını belirleyen boolean alan.
