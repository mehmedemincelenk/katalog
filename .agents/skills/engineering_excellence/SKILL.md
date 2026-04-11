---
name: engineering-excellence
description: Yazılım geliştirme standartlarını, temiz kod prensiplerini ve sürdürülebilir mimariyi yönetir. Projede bileşen temelli (Component-Based) modülerliği ve ölçeklenebilirliği garanti altına alır.
---

# Toptan Ambalajcım Mühendislik Standartları

Bu beceri, projenin kod kalitesini korumak ve modüler yapıyı sürdürmek için izlenmesi gereken kuralları tanımlar.

## 1. Bileşen Temelli Mimari (Component-Based)

### Tek Sorumluluk Prensibi (SRP)
- Her bileşen sadece bir işi mükemmel yapmalıdır.
- Eğer bir dosya 150 satırı aşıyorsa, içindeki mantıksal parçalar alt bileşenlere (sub-components) bölünmelidir.
- Örn: `ProductCard.tsx` içinde menü, resim ve metin alanları ayrı dosyalar olmalıdır.

### Klasör Yapısı Standartları
- `src/components/ui`: Durumsuz (stateless), her yerde kullanılabilen atomik bileşenler (Buton, Input, Modal, Marquee).
- `src/components/product`: Sadece ürün dünyasına ait olan bileşenler.
- `src/components/search`: Arama ve filtreleme dünyasına ait olan bileşenler.

## 2. Veri ve Mantık Yönetimi

### Mantık İzolesi (Hook Pattern)
- Bileşenler sadece **GÖRSEL** olmalıdır.
- Karmaşık hesaplamalar, API çağrıları ve veri manipülasyonları `src/hooks` içindeki özel hook'lara taşınmalıdır.
- Bileşen içinde `useEffect` kullanımı minimumda tutulmalıdır.

### Prop Yönetimi ve Context API
- **Prop Drilling Yasak:** Veriyi 2 seviyeden daha derine iletiyorsan `src/context` altındaki ilgili Context'i kullan.
- **Strict Typing:** Tüm proplar için net TypeScript `interface`'leri tanımlanmalıdır. `any` kullanımı kesinlikle yasaktır.

## 3. Kod Kalitesi ve Temizlik

### Adlandırma Kuralları (Naming)
- Bileşenler: `PascalCase` (Örn: `ProductGrid.tsx`)
- Hook'lar: `use` ile başlamalı (Örn: `useProductActions.ts`)
- Yardımcı Fonksiyonlar: `camelCase` (Örn: `calculateDiscount.ts`)

### Performans Optimizasyonu
- Ağır bileşenler için `React.memo` kullanılmalıdır.
- Gereksiz render'ları önlemek için `useCallback` ve `useMemo` stratejik olarak uygulanmalıdır.
- Resimler için her zaman `loading="lazy"` ve `aspect-ratio` tanımları yapılmalıdır.

## 4. Dosya Kontrol Listesi (QA Checklist)
1. Bu dosya 150 satırdan kısa mı?
2. İş mantığı (logic) hook'a taşındı mı?
3. Tipler (Types) eksiksiz tanımlandı mı?
4. Başka bir yerde kullanılabilir mi (Modüler mi)?
