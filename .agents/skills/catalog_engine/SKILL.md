---
name: catalog_engine
description: Ürün verilerini Google Sheets üzerinden yönetir ve müşteri aramalarını takip eder.
---
# Katalog Yönetim Motoru

## 1. Veri Akışı (Data Flow)
- **Okuma:** PapaParse ile Google Sheets CSV linkinden çekilir.
- **Yazma:** Google Apps Script (POST) üzerinden senkronize edilir.
- **Cache:** Hız için `localStorage` üzerinden `categoryOrder` gibi bilgiler saklanır.

## 2. Kategori Sıralama Mantığı
- Reyon sırası Google Sheets'teki `categories` sekmesine göre belirlenir.
- Yeni eklenen ürünler, mevcut olmayan bir kategoriye sahipse bu kategori listenin sonuna eklenir.

## 3. Arama Takibi (Analytics)
- `useProducts` kancası, 3 karakterden uzun aramaları 2 saniye bekledikten sonra (debounce) `search_logs` sekmesine kaydeder.
- Bu işlem kullanıcıyı bekletmeden (no-cors) arka planda yapılır.

## 4. Hata ve Bakım
- Uygulama `loading` ve `error` durumlarını `useProducts`'tan alır.
- Hata durumunda (İnternet yok, Sheets linki bozuk vb.) kullanıcıya standart katalog yerine nezaketli bir "Bakım Modu" ekranı gösterilir.
