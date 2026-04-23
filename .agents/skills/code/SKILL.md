---
name: code
description: 'Üst düzey React mimarisi, temiz kod ve modüler SaaS standartlarını yöneten teknik direktifler.'
---

# 🤖 ARCHITECTURE & ENGINEERING PROTOCOL

Bu protokol, projenin yapısal bütünlüğünü, profesyonel netliğini ve SaaS (Çoklu Mağaza) uyumluluğunu garanti altına alan teknik emirleri içerir.

## 1. MİMARİ İZOLASYON & SAAS STANDARTLARI

- **Technical Blindness:** Kod tabanı görsel ve metinsel içerikten bağımsız olmalıdır. Tüm değişkenler `src/data/config` üzerinden enjekte edilmelidir.
- **Strict Design Tokens:** `.tsx` dosyaları içinde Tailwind sınıfları veya ham değerler (renk, boşluk) doğrudan yazılmamalıdır. Her zaman `THEME` objesi referans alınmalıdır.
- **Context Verification:** Her kod değişikliği öncesi `src/data/config` içindeki ilgili değişkenler (THEME/LABELS) kontrol edilmelidir.
- **Logic Segregation (Hook Pattern):** Bileşenler sadece GÖRSEL (stateless/dumb) katmanlardır. Veri manipülasyonu ve API çağrıları `src/hooks` altına izole edilmelidir.
- **State Machine Architecture:** UI durumları (Loading, Success, Error) için "Boolean Hell" yerine Enum veya Union tabanlı durum makineleri zorunludur.

## 2. MÜHENDİSLİK STANDARTLARI (ZERO-DEFECT)

- **Context Balance (Vibe vs. Fragment):** Bileşenler gereksiz yere mikro-parçalara bölünmemelidir; "Vibe" ve görsel bütünlük tek bir dosyada korunabilir. Ancak dosya **300 satırı** aşarsa veya teknik altyapı (API/Logic) görsel kodun okunabilirliğini engellerse, altyapı kodları `hooks` katmanına izole edilmelidir.
- **SRP (Single Responsibility Principle):** Görsel katman (UI) ve Veri katmanı (Logic) ayrımı esastır. UI dosyası "nasıl göründüğüne", Hook dosyası "ne yaptığına" odaklanır. Dosyalar genel olarak **150-200 satır** bandında tutulmalıdır; bu sınırı aşan kompleks mantıklar mutlaka dekompoze edilmelidir.
- **Strict Typing (TypeScript):** Tüm veri yapıları için net `interface` tanımlanmalıdır. `any` kullanımı protokol dışıdır.
- **Hiyerarşik Düzen:**
  - `src/components/ui`: Atomik elementler.
  - `src/components/[feature]`: Özelleştirilmiş modüller.

## 3. İSİMLENDİRME PROTOKOLÜ (A-LEVEL)

- **Self-Documenting Code:** Kod, ek belgelendirmeye ihtiyaç duymadan kendini açıklamalıdır. Profesyonel İngilizce zorunludur.
- **Nizam:**
  - Bileşenler: `PascalCase`.
  - Değişkenler: `camelCase`.
  - Hook'lar: `use` prefix'i ile başlar.

## 4. PERFORMANS & OPTİMİZASYON DİREKTİFLERİ

- **Memoization:** Gereksiz render döngüleri `React.memo`, `useCallback` ve `useMemo` ile engellenmelidir.
- **Asset Optimization:** Görsellerde `loading="lazy"`, `aspect-ratio` ve LQIP (Low-Quality Image Placeholder) kullanımı kritiktir.
- **Continuous Refactoring:** Fonksiyonellik korunarak kod sürekli modernize edilmelidir.

## 5. DOĞRULAMA KONTROL LİSTESİ

1. İsimlendirmeler teknik İngilizce standartlarına uygun mu?
2. Tüm UI değerleri `THEME` üzerinden mi besleniyor?
3. Dosya satır limiti ve hook izolasyonu sağlanmış mı?
4. TypeScript tanımları %100 kapsama sahip mi?

---

_Status: OPERATIONAL. Error Limit: 0. Component Machine engaged._ 🦾
