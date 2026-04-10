# Security by Design (Siber Savunma ve Mimari Güvenlik)

Bu uzmanlık alanı, uygulamanın her aşamasında (tasarım, kodlama, dağıtım) güvenlik açıklarını önlemek ve AI tabanlı saldırılara karşı dirençli bir mimari kurmak için tasarlanmıştır.

## 1. Temel Direktifler
- **Sıfır Güven (Zero Trust):** Hiçbir isteğe (istemci tarafı dahil) "güvenli" gözüyle bakma. Her isteği doğrula.
- **En Az Yetki Prensibi:** Bir bileşen veya servis, sadece yapması gereken iş için gereken minimum yetkiye sahip olmalıdır.
- **Savunma Derinliği:** Tek bir güvenlik katmanına güvenme. Bir katman aşılsa bile (örneğin Admin şifresi) diğer katmanlar (örneğin IP kısıtlaması, MFA) korumaya devam etmelidir.

## 2. Kritik Güvenlik Standartları
### Veri ve Anahtar Koruması
- **Secrets Management:** `.env` dosyalarını asla commit etme. API anahtarlarını kod içinde "hardcoded" tutma.
- **Encryption:** Hassas verileri (varsa müşteri telefonları, cirolar vb.) hem iletimde (HTTPS) hem de depolamada şifrele.

### Kimlik ve Erişim Yönetimi (IAM)
- **Şifresiz Güvenlik:** 40-50 yaş grubu için "Magic Link" ve "WhatsApp Auth" kullanırken, token'ların süreli ve tek kullanımlık olmasını sağla.
- **CSRF & XSS Koruması:** Kullanıcıdan gelen her girdiyi (input) temizle (sanitize). React'in doğal XSS korumasını bozacak `dangerouslySetInnerHTML` kullanımından kaçın.

### SaaS ve Multi-tenancy Güvenliği
- **Tenant Isolation:** Bir müşterinin verisinin diğerine sızmasını (Data Leakage) engellemek için veritabanı sorgularında her zaman `tenant_id` filtresini zorunlu kıl.
- **Rate Limiting:** AI botlarının sistemi yormasını veya veri kazımasını (scraping) engellemek için saniye/dakika bazlı istek sınırları koy.

## 3. AI-Ready Savunma Stratejisi
- **Anomali Tespiti:** Olağan dışı büyüklükte veri çekme veya hatalı giriş denemelerini logla.
- **Code Auditing:** Yazılan kodun OWASP Top 10 açıklarını (Injection, Broken Auth vb.) barındırmadığından emin ol.

## 4. Uygulama Rehberi
1. Bir özellik eklemeden önce "Bu özellik nasıl suistimal edilebilir?" sorusunu sor.
2. Hata mesajlarında saldırgana yol gösterecek detaylar (örneğin: "Yanlış şifre" yerine "Giriş başarısız") verme.
3. Bağımlılıkları (npm packages) düzenli olarak tara ve güncel tut.

---
*Geleceğin dünyasında en iyi saldırı, aşılmaz bir savunmadır.*
