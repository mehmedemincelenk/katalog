---
name: diamond_component_machine
description: 'Hatasız, Vibe-Coding odaklı, üst düzey React bileşen mimarisi ve kalite güvence protokolü.'
---

# 🤖 THE DIAMOND COMPONENT MACHINE (QA & PROTOCOL)

Bu protokol, yazılan her satır kodun "Diamond Standard" seviyesinde, hatasız ve estetik odaklı (Vibe Coding) üretilmesini sağlar.

## ⚙️ CORE OPERATING SYSTEM (Hatasızlık YasLawsı)

1.  **Z-P (Zero-Prop) Error:** Hiçbir bileşen, propların eksikliği veya yanlış formatı nedeniyle çökemez. `destructuring` sırasında her zaman `[]`, `{}` veya `""` varsayılanları zorunludur.
2.  **Null-Safety Protocol:** Teknik olarak `undefined` veya `null` dönebilecek her veri noktası (API, LocalStorage, Context) opsiyonel zincirleme (`?.`) ve nullish coalescing (`??`) ile korunacaktır.
3.  **No-Ghost Content:** Veri yüklenirken veya boşken oluşan "hayalet" görüntüler (layout shift) `Loading` state'leri veya stabil `min-height` değerleri ile engellenmelidir.

## 📐 VISUAL REGRESSION AUDIT (Geometrik Denetim)

1.  **Geometry Check:** Yapılan her değişiklikten sonra 16:9 ve 32:9 oranları, `8px` grid ritmi ve `rounded-lg` tutarlılığı matematiksel olarak doğrulanmalıdır.
2.  **Negative Space Audit:** Yeni eklenen elementler "White Space" (negatif alan) nizamını bozmamalı; arayüz asla "sıkışık" veya "kaotik" (cluttered) hissettirmemelidir.
3.  **Consistency Sync:** State değişimlerinde (loading -> success) layout shift (ekran kayması) limitleri sıfıra indirilmelidir.

## 🎨 VIBE ARCHITECTURE (Estetik Mühendisliği)

1.  **Tokenized UI:** Tüm stil kararları `THEME` objesinden beslenmelidir. "Magic Numbers" (rastgele px değerleri) yasaktır.
2.  **Interaction Engine:** Tüm kullanıcı etkileşimleri (hover, focus, click) en az bir görsel geri bildirim (soft transition, scale, highlight) içermelidir.
3.  **Apple-Level Spacing:** Negatif alan (White Space) kullanımı bir hata değil, tasarımsal bir karardır. `plan.md` içindeki boşluk talepleri bu makinenin önceliğidir.

## 🏗️ COMPONENT REFACTORING PROTOCOL

1.  **D-R-Y (Don't Repeat Yourself):** Aynı mantık veya UI parçası 2'den fazla yerde geçiyorsa, atomik bir bileşene veya `hook`'a dönüştürülmelidir.
2.  **Atomic Structure:** Bileşenler tek bir sorumluluğa odaklanmalıdır. Dev bileşenler gerekirse alt parçalara (Sub-components) bölünmelidir.
3.  **State Machine Logic:** Karmaşık UI durumları sadece Boolean (`true/false`) ile yönetilemez. Her zaman net durum makineleri (Idle, Loading, Success, Error) kullanılmalıdır.
4.  **LCP Optimization:** "Vibe" sadece görsellik değil, aynı zamanda hızdır. Görseller her zaman lazy-loading ve aspect-ratio korumasıyla işlenmelidir.

---

_Machine Status: OPTIMAL. Mode: MASTER VIBE CODING. Error Tolerance: 0%._ 💎🦾
