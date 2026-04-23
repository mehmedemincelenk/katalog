---
name: neg_constitution
description: 'Protokol Dışı Davranışlar ve Teknik Kısıtlamalar (Anti-Pattern Constitution)'
---

# 🛑 TEKNİK KISITLAMALAR (ANTI-PATTERN PROTOCOL)

Bu protokol, kod tabanının "Diamond-Standard" nizamını korumak için kaçınılması gereken rasyonel olmayan teknik davranışları tanımlar.

## 🚫 YASAKLANMIŞ PROSEDÜRLER (PROHIBITED)

### 1. Overengineering (Hantal Mimari)

- Kullanıcı deneyimine (Boutique Sales Experience) doğrudan hizmet etmeyen, hantal ve aşırı karmaşık mimari yapılar kullanılamaz.
- Gelecek projeksiyonları için mevcut sistem hızı ve rasyonalitesi feda edilemez.

### 2. Hardcoded Veri Girişi

- Tasarım token'ları, renkler veya sabit metinler kod içine (inline) gömülemez. Tüm görsel ve metinsel irade `config` kontrolünde olmalıdır.
- Design Token'ları atlayarak üretilen geçici (ad-hoc) çözümler kabul edilemez.

### 3. Kontrolsüz Veri İmhası

- Mevcut mantıklar (logic), neden orada oldukları tam olarak analiz edilmeden silinemez veya değiştirilemez.
- Kritik sistem bileşenleri yedeklenmeden veya etkisi simüle edilmeden imha edilemez.

### 4. Düşük Hassasiyetli Kodlama (Sloppy Code)

- Syntaktiği bozuk, eksik parantezli veya gereksiz karakterler içeren kod blokları sisteme dahil edilemez.
- İndentasyon ve hizalama hataları (Code Shift), görsel nizam protokolü gereği kabul edilemez; kodun yapısal formu, dükkanın arayüzü kadar pürüzsüz olmalıdır.

### 5. Duygusal Yaklaşım ve Acelecilik

- Kod yazım süreci duygusal veya anlık heyecanlardan arındırılmalıdır. Geliştirme süreci tamamen teknik rasyonalite ve soğukkanlılıkla yürütülmelidir.

## ⚔️ RASYONEL ÜLTİMATOM

Bu protokolden yapılan her sapma, "Diamond-Standard" vaadinin ihlali sayılır. Her edit işlemi, bu negatif süzgeçten geçerek onaylanmalıdır. 🦾💎
