---
trigger: always_on
---

---
name: first-rules
description: Vibe Coding Manifestosu, K.I.S.S. ve TypeScript Mühendislik Standartları.
---

# VİBE CODİNG MANİFESTOSU & TEKNİK ANAYASA

## 1. Vibe Coding Nedir? (Temel Öğreti)
Vibe Coding, geliştirmenin **hissiyat ve akış** üzerine kurulu olduğu bir yaklaşımdır.
- **Kullanıcının ihtiyacına bugün cevap verirsin.** Altı ay sonra belki lazım olur diye yapı kurmazsın.
- **Prototip hızına saygı duyarsın.** Mükemmel mimariden önce çalışan ürün gelir.
- **Arayüze (UI), emojiye, renge, hissiyata önem verirsin.** İnsanın tuttuğu ve gördüğü şey her şeyden önemlidir.
- **Yorumlamak yerine kodlarsın.** Kullanıcı söylüyor, sen anlık yapıyorsun.

## 2. K.I.S.S. Prensibi (Keep It Simple, Stupid)
- **Kural:** Eğer bugün **tek bir kullanıcı** için çözüm üretiyorsan, en basit çalışan kod en doğru koddur.
- Daha az kod = daha az hata = daha kolay bakım.
- Her yeni soyutlama, her yeni dosya, her yeni bağımlılık bir **borca** dönüşür.
- Bu proje bir B2B Katalogdur. Hedef: Ürünleri göster, admin düzenlesin, müşteri görsün.

## 3. Overengineering (Kaçınılması Gerekenler)
| Overengineering İşareti | Doğru Vibe Coding Alternatifi |
|---|---|
| Gereksiz State Kütüphanesi | `useState` + custom hook yeterli |
| Çok katmanlı klasör yapısı | Direkt `components`, `hooks`, `utils` yeterli |
| Genel amaçlı soyutlamalar | Direkt ihtiyaca özel kod yaz, soyutlama sonra yapılır |
| Her şeyi `any` yapmak | Doğru TypeScript interfacelerini kullan |

## 4. TypeScript Standartları (Teknik Kalite)
TypeScript bir engel değil, bir **koruyucudur**.
- **Interface Kullanımı:** Veri modelleri (Product, Category) için mutlaka interface tanımlanmalıdır.
- **Strict Mode:** `any` tipi KESİNLİKLE yasaktır. Belirsiz durumlarda `unknown` kullan ve tip kontrolü yap.
- **Component Tipleri:** React bileşenleri `React.FC` veya direkt fonksiyon tipleriyle (Props) tanımlanmalıdır.
- **Readonly:** Statik veriler ve config objeleri için `as const` veya `Readonly` kullanarak kazara değişimi engelle.

## 5. Component-Based Mimari
- Her bileşen **tek bir şey yapar** (Single Responsibility).
- State, onu kullanan en yakın üst bileşende tutulur (State'i hemen `App.tsx`'e çekme).
- İş mantığı custom hook'lara (`useProducts`, `useAdminMode`) taşınır, UI bileşenleri saf (pure) kalır.

## 6. Genel Kodlama Kuralları
- **Merkezi Kontrol:** Tüm sabitler (renkler, tel, marka adı) `src/data/config.ts` dosyasında tutulur.
- **Dil:** Tüm UI etiketleri ve placeholder'lar yüksek kaliteli Türkçe olmalıdır. Kod yorumları Türkçe, kod isimleri evrensel (İngilizce) olmalıdır.
- **Git:** Her anlamlı değişiklik (feature/fix) için açıklayıcı bir `git commit` mesajı yazılmalıdır.
- **Performans:** Resimler 250px'e sıkıştırılmalı ve `loading="lazy"` kullanılmalıdır.
