---
name: design
description: 'Apple standartlarında estetik, mobil öncelikli UX ve siber güvenlik odaklı tasarım protokolü.'
---

# 🎨 DESIGN & SECURITY PROTOCOL

Bu protokol, projenin sadece "premium" hissettirmesini değil, her aşamada güvenliğin tasarımın ayrılmaz bir parçası olmasını (Sec-by-Design) garanti eder.

## 1. GÖRSEL ESTETİK (UI/UX ENGINE)

- **8px Grid Protocol:** Tüm boşluklar (padding/margin) ve boyutlar 8'in katı (4, 8, 16, 32...) olmak zorundadır. Matematiksel ritim esastır.
- **Typography Matrix:** Sans-serif (Inter/SF Pro). Başlıklar kalın, alt metinler ince/orta. `leading-relaxed` (1.5) ile maksimum okunabilirlik.
- **Pure Palette (60-30-10):** %60 nötr (Stone/Slate), %30 ikincil, %10 vurgu (Amber/Kraft).
- **Z-Index Layering:** `backdrop-blur-xl` ve yumuşak gölgelerle hiyerarşi matematiksel olarak kurgulanmalıdır.

## 2. ERİŞİLEBİLİRLİK (ACCESSIBILITY AS A LUXURY)

- **Technical Semantic:** Doğru HTML5 elementleri (`main`, `nav`, `section`) ve `aria-label` kullanımı bir zorunluluktur.
- **Keyboard Navigation:** Proje sadece dokunmatik değil, klavye ile de kusursuz (Focus states) yönetilebilmelidir. "Apple-level" kalite, her platformda kapsayıcı olmayı gerektirir.
- **Contrast Ratios:** Tüm metin ve ikon kontrastları WCAG standartlarına uygun, göz yormayan ama net okunabilir seviyede tutulmalıdır.

## 3. MOBİL ÖNCELİKLİ ERGONOMİ

- **Thumb-Drive Design:** Kritik aksiyonlar başparmak alanında (ekranın alt yarısı) tutulmalıdır.
- **Interaction Targets:** Her tıklanabilir alan en az **44x44px** standartlarına uygun olmalıdır.
- **Responsive Matrix:** Mobilde tek sütun, masaüstünde dinamik grid yapısı (2-6 sütun).
- **LCP Speed:** Resimler `loading="lazy"`, kritik Hero öğeleri `fetchpriority="high"`.

## 3. SİBER SAVUNMA (SEC-BY-DESIGN)

- **Zero Trust Architecture:** Güvenlik bir tasarım öğesidir.
- **Tenant Isolation:** SaaS yapısı için her sorguda `tenant_id` / `store_slug` izolasyonu zorunludur.
- **Access Control:** Admin yetkileri sadece valid session/PIN ile sınırlıdır. Hata mesajları saldırgan için bilgi içermez.
- **Data Sanitization:** Tüm girdi verileri XSS/CSRF riskine karşı sanitize edilir. `dangerouslySetInnerHTML` yasaktır.

## 4. İNTERAKTİF GERİ BİLDİRİM (FEEDBACK LOGIC)

- **Haptic Simulation:** Butonlarda `scale-95` ile fiziksel basma hissi.
- **Visual Feedback:** İşlemlerin başarısı net, sofistike bildirimlerle onaylanmalıdır.
- **Transition Continuity:** Modallar ve geçişler sadece `fade-in` veya `slide` metotlarıyla, yumuşak bir akışla gerçekleşmelidir.

## 5. ANALİZ ALGORİTMASI

1. "Bu özellik 8px grid sistemine uyuyor mu?"
2. "Siber güvenlik açığı oluşturma riski var mı?"
3. "Mobil kullanımda 44px hedef alanı korunuyor mu?"

---

_Protokol aktif. Estetik matematiksel bir sonuçtur._ 🦾💎
