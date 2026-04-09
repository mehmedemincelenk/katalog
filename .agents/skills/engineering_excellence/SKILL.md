---
name: engineering_excellence
description: Yazılım geliştirme standartlarını, temiz kod prensiplerini ve sürdürülebilir mimariyi yönetir.
---

# Mühendislik Mükemmelliği Rehberi (Engineering Excellence)

Bu beceri, projenin sadece "çalışmasını" değil, aynı zamanda "okunabilir, genişletilebilir ve zarif" olmasını sağlar.

## 1. KISS (Keep It Simple, Stupid)
**Temel:** "Basit tut, aptal olma." Bir problemi çözmek için en karmaşık yolu değil, en anlaşılır yolu seçmektir.
**Detay:**
- Gereksiz soyutlamalardan (over-engineering) kaçın.
- Bir fonksiyon veya bileşen tek bir işi en sade şekilde yapmalı.
- "Zekice" (clever) kod yazmak yerine "okunabilir" kod yaz. 6 ay sonra baktığında kodu anlamak için dahi olmana gerek kalmamalı.

## 2. SOLID Prensipleri
**Temel:** Yazılımın esnek ve bakımı kolay olmasını sağlayan 5 altın kural.
**Detay:**
- **S (Single Responsibility):** Bir bileşen/fonksiyon sadece BİR nedenden dolayı değişmeli. (Örn: `ProductCard` sadece ürünü göstermeli, veri çekmemeli).
- **O (Open/Closed):** Kod gelişime açık, değişime kapalı olmalı. Mevcut kodu bozmadan yeni özellik eklenebilmeli.
- **L (Liskov Substitution):** Alt sınıflar, üst sınıfların yerine geçebilmeli (React'te propların tutarlılığı gibi).
- **I (Interface Segregation):** Kimse kullanmadığı metodlara/proplara zorlanmamalı. (Büyük proplar yerine parçalanmış yapılar).
- **D (Dependency Inversion):** Üst seviye mantık, alt seviye detaylara bağımlı olmamalı. (Örn: `useProducts` hook'u verinin nereden geldiğini [Sheets mi Supabase mi] bilmek zorunda kalmamalı, sadece veri beklemeli).

## 3. Component-Based Architecture
**Temel:** Uygulamayı tekrar kullanılabilir, bağımsız "yapı taşlarına" (bileşenlere) bölmek.
**Detay:**
- **Atomic Design:** `Atom` (buton), `Molecule` (arama barı), `Organism` (navbar).
- **Isolation:** Bir bileşeni yerinden söküp başka bir sayfaya taktığında çalışmaya devam etmeli.
- **Dumb vs Smart Components:** Veriyi yöneten "Akıllı" (Logic) bileşenler ile sadece görseli basan "Aptal" (UI) bileşenleri ayır.

## 4. Functional Programming (FP)
**Temel:** Veriyi değiştirmek (mutate) yerine, yeni veri türetmek ve fonksiyonları girdi-çıktı odaklı kullanmak.
**Detay:**
- **Immutability:** `state.push()` yerine `[...state, newItem]` kullan. Geçmişi koru.
- **Pure Functions:** Aynı girdiyle her zaman aynı çıktıyı veren, yan etkisi olmayan fonksiyonlar.
- **Declarative Code:** "Nasıl yapacağını" değil "Ne yapacağını" söyle. `for` döngüsü yerine `.map()`, `.filter()`, `.reduce()` kullan.

## 5. Sürdürülebilir Kod (Sustainable Code)
**Temel:** Kodun gelecekte de kolayca güncellenebilmesi ve teknik borç yaratmaması.
**Detay:**
- **Documentation:** Sadece "ne" yapıldığını değil, "neden" yapıldığını açıklayan yorum satırları.
- **Testing:** Kritik mantıkları (indirim hesaplama, fiyat formatlama) testlerle koruma altına al (`vitest`).
- **Standardization:** Değişken isimlendirmeleri (camelCase), dosya yapısı ve klasörleme düzenine sadık kal.

## 6. VibeCode (Sezgisel ve Uyumlu Kod)
**Temel:** Kodun akışının doğal, geliştirici dostu ve "doğru hissettirmesi" (flow-state).
**Detay:**
- **Consistency:** Bir çözüm yolu seçtiysen (örn: Tailwind), tüm projede o yolu izle.
- **Predictability:** Bir fonksiyonun ismine bakıldığında ne döndüreceği tahmin edilebilmeli.
- **AI-Optimized:** Kodun yapısı temiz ve modüler olmalı ki AI (Gemini/Cursor) bağlamı kolayca anlayıp doğru öneriler sunabilsin.
- **Developer Experience (DX):** Kod yazarken keyif almanı sağlayan, temiz hata mesajları ve yardımcı araçlar içeren yapı.

---

## 🚫 7. DÜŞMAN 1: Over-engineering (Aşırı Mühendislik)
**Nedir?** Basit bir problem için atom bombası kullanmaktır. Henüz ihtiyaç yokken "ileride lazım olur" diye karmaşık yapılar kurmaktır.
**Örnek:** Sadece bir "Merhaba" yazdıracak buton için kütüphane kurmak, 5 katmanlı bir "Provider" yapısı oluşturmak ve 10 tane generic tip tanımlamak.
**Nasıl Kaçınılır?**
- **YAGNI (You Ain't Gonna Need It):** "Buna şu an ihtiyacın yok." Sadece bugünün problemini çöz.
- **Problem Odaklılık:** Önce en basit haliyle çöz, eğer gerçekten gerekirse (ve sadece o zaman) geliştir.

## 🚫 8. DÜŞMAN 2: Spagetti Kod (Karışık Kod)
**Nedir?** Mantığın birbirine girdiği, başı sonu belli olmayan, bir ucu çekince diğer ucu kopan düzensiz koddur.
**Örnek:** Bir `if` bloğu içinde başka bir `if`, onun içinde bir `fetch`, onun içinde DOM manipülasyonu ve tüm bunların 500 satırlık tek bir fonksiyonda olması.
**Nasıl Kaçınılır?**
- **Sıvılaşmayı Önle:** Kodun "çorba" olmasına izin verme. Uzayan fonksiyonları küçük, anlamlı parçalara böl.
- **Bağımlılık Kontrolü:** Fonksiyonlar birbirine aşırı göbekten bağlı olmasın (Decoupling).
- **Hiyerarşi:** Mantığı (Logic), Veriyi (Data) ve Görseli (UI) birbirinden ayır.
