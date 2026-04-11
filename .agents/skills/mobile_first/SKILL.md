---
name: mobile_first
description: Mobil öncelikli tasarım, dokunmatik etkileşimler ve performans odaklı arayüz yönetimi sağlar.
---

# Mobil Öncelikli Tasarım Rehberi (Mobile-First Excellence)

Bu rehber, projenin sadece masaüstünde değil, kullanıcıların %80'inden fazlasının geldiği mobil cihazlarda "kusursuz" ve "uygulama (app) hissi" vermesini sağlar.

## 1. Mobil Öncelikli Düşünce Yapısı (Mobile-First Thinking)
**Temel:** Tasarıma en küçük ekrandan (iPhone SE / 320px) başla, sonra genişlet.
**Detay:**
- **Layout Hiyerarşisi:** En önemli içeriği en üste koy. Mobilde ekran alanı kısıtlıdır, "above the fold" (ekranın ilk görünen kısmı) kritik öneme sahiptir.
- **Kademeli Geliştirme (Progressive Enhancement):** Küçük ekranlar için basit ve hızlı bir temel oluştur, ekran büyüdükçe (sm, md, lg, xl) özellikleri ve görselliği zenginleştir.

## 2. Dokunmatik Dostu Etkileşimler (Touch Targets & Ergonomics)
**Temel:** Parmaklar mouse imleci kadar hassas değildir.
**Detay:**
- **Tıklama Alanları (Hit Targets):** Butonlar ve linkler en az 44x44px boyutunda olmalıdır.
- **Başparmak Bölgesi (Thumb Zone):** Kritik butonları (Sepete Ekle, Filtrele vb.) kullanıcının başparmağıyla kolayca ulaşabileceği orta ve alt kısımlara yerleştir.
- **Feedback:** Dokunulduğunda görsel bir tepki (örn: `active:scale-95`) mutlaka verilmeli.

## 3. Akışkan Izgara ve Esnek Görseller (Fluid Layouts)
**Temel:** Sabit genişliklerden (px) kaçın, yüzdelik (%) ve viewport (vw/vh) birimlerini kullan.
**Detay:**
- **Konteynerler:** `w-full` veya `max-w-screen-xl` gibi esnek yapılar kullan.
- **Görseller:** Görsellerin ekranı taşmaması için `max-w-full` ve `h-auto` kullan.
- **Tipografi:** Küçük ekranlarda metinlerin okunabilirliğini koru (min 14px-16px).

## 4. Performans ve Yükleme Hızı (Mobile Performance)
**Temel:** Mobil kullanıcılar sabırsızdır ve bağlantıları zayıf olabilir.
**Detay:**
- **Görsel Optimizasyonu:** WebP formatı kullan, görselleri "lazy load" ile sadece ekrana girince yükle.
- **Kod Küçültme:** Gereksiz kütüphanelerden kaçın, CSS ve JS dosyalarını minimize et.
- **İskelet Ekranlar (Skeleton Screens):** İçerik yüklenirken boş beyaz ekran yerine hafif gri alanlar göstererek "yükleniyor" hissini iyileştir.

## 5. Uygulama Hissi (App-like Experience)
**Temel:** Web sitesinin bir mobil uygulama gibi davranmasını sağla.
**Detay:**
- **Sabit Elemanlar:** Alt navigasyon barı (Bottom Nav) veya yüzen aksiyon butonları (FAB) kullanarak hızlı erişim sağla.
- **Smooth Scrolling:** Sayfa içi geçişlerde `scroll-smooth` kullanarak yumuşak bir akış sağla.
- **Form Elemanları:** Mobil klavyenin düzgün açılması için `input` tiplerini (email, tel, number) doğru seç.

## 6. Apple & Android Standartları
**Temel:** Cihazların yerleşik davranışlarına (Gestures) uyum sağla.
**Detay:**
- **Geri Kaydırma (Swipe to Back):** Sol kenardan kaydırınca geri gitme beklentisini bozma.
- **Sistem Fontları:** Mobil cihazlarda kullanıcıların alıştığı sistem fontlarını (SF Pro, Roboto) önceliklendir.
