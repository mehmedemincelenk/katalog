
import { parsePrice, formatPrice, calculateDiscount } from './src/utils/price.ts';

console.log("🚀 Toptan Ambalajcım - Motor Mantığı QA Testi Baslatılıyor...\n");

function test(name, result, expected) {
  const status = result === expected ? "✅ BAŞARILI" : "❌ HATALI";
  console.log(`${status} | ${name}`);
  if (result !== expected) {
    console.log(`   -> Beklenen: ${expected}, Alınan: ${result}`);
    process.exit(1);
  }
}

// 1. Fiyat Ayrıştırma Testleri
test("parsePrice: ₺ formatı", parsePrice("₺150,50"), 150.5);
test("parsePrice: Boşluklu format", parsePrice("150.50 ₺"), 150.5);
test("parsePrice: Sadece rakam", parsePrice("100"), 100);

// 2. İndirim Hesaplama Testleri
test("calculateDiscount: %5 indirim (TA5)", calculateDiscount("₺100,00", 0.05).replace(/\u00a0/g, ' '), "₺95,00");
test("calculateDiscount: %10 indirim (KOPUK10)", calculateDiscount("₺200,00", 0.10).replace(/\u00a0/g, ' '), "₺180,00");
test("calculateDiscount: 0 TL kontrolü", calculateDiscount("₺0,00", 0.10), "₺0,00");

console.log("\n🎯 TÜM MOTOR MANTIĞI TESTLERİ GEÇTİ. SİSTEM GÜVENLİ.");
