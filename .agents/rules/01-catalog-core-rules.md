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
- **Performans:** Resimler `base64` formatına dönüştürülmeden **önce** mutlaka `250px` boyutuna sıkıştırılmalıdır (Google Sheets 32KB hücre sınırı nedeniyle).
- **Offline/Hata:** Veri çekilemezse veya internet yoksa şık bir "Bakım Modu" ekranı gösterilir.

## 2. Teknik Standartlar (TypeScript)
- **Dil:** Proje tamamen TypeScript (TSX) ile yazılmalıdır.
- **Tip Güvenliği:** `any` kullanımı yasaktır. Tüm veri modelleri (`Product`, `Category`) `src/types/index.ts` içindeki arayüzleri (interfaces) kullanmalıdır.
- **Linting:** ESLint ve Prettier kurallarına (tek tırnak, semikolon) sıkı sıkıya uyulmalıdır.

## 3. Admin ve Güvenlik
- **Giriş:** Footer logosuna 2 saniye içinde 7 kez tıklanarak aktif edilir.
- **Senkronizasyon:** Admin panelinden yapılan her değişiklik (`ADD`, `UPDATE`, `DELETE`, `RENAME`) anlık olarak Google Sheets ile senkronize edilir.

## 4. UI/UX ve Tasarım
- **Renk Paleti:** Kraft (Toprak tonları), Beyaz ve Siyah.
- **Mobil Öncelik:** Tasarım önce mobil cihazlar için optimize edilir, PC için `sm:` önekli büyük fontlar kullanılır.
- **Kategori Sınırı:** Masaüstünde ilk 8 kategori gösterilir, gerisi "+X Daha" butonuyla açılır. Mobilde tümü menü içinde görünür.
- **Lazy Loading:** Tüm ürün resimleri `loading="lazy"` özniteliğine sahip olmalıdır.

## 5. Arama ve İstatistik
- 3 karakterden uzun arama terimleri 2 saniye bekledikten sonra (debounce) `search_logs` sayfasına tarihle beraber kaydedilir.
