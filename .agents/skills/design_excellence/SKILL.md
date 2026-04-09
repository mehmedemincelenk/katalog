---
name: design_excellence
description: Apple standartlarında minimalizm, modern UI/UX prensipleri ve görsel estetik yönetimini sağlar.
---

# Tasarım Mükemmelliği Rehberi (Design Excellence)

Bu rehber, projenin sadece "fonksiyonel" değil, aynı zamanda "arzulanabilir" ve "premium" hissettirmesini sağlar. Apple'ın tasarım felsefesinden (HIG) ilham alır.

## 1. Minimalizm (Az Ama Öz)
**Temel:** Gereksiz her şeyi çıkar. Sadece kullanıcıya o an lazım olanı göster.
**Detay:**
- **Signal-to-Noise Ratio:** Ekranda dikkat dağıtan öğeleri (gürültü) azalt, içeriği (sinyal) öne çıkar.
- **Negative Space (Beyaz Boşluk):** Boşluk korkusundan kurtul. Boşluklar içeriğin nefes almasını ve kullanıcının odaklanmasını sağlar.
- **Progressive Disclosure:** Karmaşık bilgileri hemen gösterme. Kullanıcı tıkladıkça veya ihtiyaç duydukça aç (örn: Ürün detay modalı).

## 2. Apple Standartları (HIG - Human Interface Guidelines)
**Temel:** Tutarlılık, netlik ve derinlik.
**Detay:**
- **Clarity:** Metinler her boyutta okunabilir, ikonlar net ve işleviyle uyumlu olmalı.
- **Deference:** Tasarım, içeriğin önüne geçmemeli. UI, içeriği (ürünleri) taşıyan zarif bir kaptır.
- **Depth:** Katmanlar arası hiyerarşi (Z-index). Gölgeler (shadows) ve bulanıklık (blur) efektleriyle neyin üstte olduğunu hissettir.

## 3. Tipografi ve Hiyerarşi
**Temel:** Yazı fontu sadece "yazı" değildir, bir tasarım öğesidir.
**Detay:**
- **Font Ailesi:** Sans-serif (örn: Inter, SF Pro, Montserrat) kullanarak modern ve temiz bir hava yakala.
- **Ağırlık Kontrastı:** Başlıklar kalın (bold), alt metinler ince (light/regular) olmalı.
- **Okunabilirlik:** Satır aralığı (line-height) ve harf arası boşluk (letter-spacing) ile metnin nefes almasını sağla.

## 4. 8px Izgara Sistemi (Grid & Rhythm)
**Temel:** Tüm boşlukların ve boyutların 8'in katı (4, 8, 16, 24, 32...) olması.
**Detay:**
- Bu kural, projenin her ekranında "matematiksel bir düzen" ve "görsel bir ritim" olmasını sağlar.
- Padding ve Margin değerlerini rastgele (örn: 13px) değil, 8px sistemine göre ver (örn: `p-4` Tailwind'de 16px'e tekabül eder).

## 5. Renk Teorisi (Minimalist Palet)
**Temel:** Karmaşadan kaçınan, gözü yormayan renkler.
**Detay:**
- **Nötr Renkler:** Beyaz, siyah ve gri tonları (Stone, Slate, Zinc) ana iskeleti oluşturmalı.
- **Vurgu Rengi (Accent Color):** Sadece önemli butonlarda ve aksiyonlarda tek bir canlı renk kullan (Örn: Senin projen için Kraft/Amber tonları).
- **60-30-10 Kuralı:** %60 ana renk (beyaz/gri), %30 ikincil renk, %10 vurgu rengi.

## 6. İnteraktif Geri Bildirim (Micro-interactions)
**Temel:** Kullanıcının her hareketine sitenin "canlı" bir tepki vermesi.
**Detay:**
- **Hover Effects:** Butonun üzerine gelince hafifçe büyümesi veya renginin yumuşaması.
- **Smooth Transitions:** Sayfalar veya modallar arası geçişlerin "pat" diye değil, yumuşak bir animasyonla açılması.
- **Active State:** Tıklanan öğenin hafifçe küçülerek (scale-95) fiziksel bir buton hissi vermesi.
