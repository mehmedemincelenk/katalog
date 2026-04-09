const fs = require('fs');
const allData = JSON.parse(fs.readFileSync('prepared_products.json', 'utf8'));
const products = allData.products;
const url = 'https://script.google.com/macros/s/AKfycbzuN6VzBgti2dfgJE1bAgV_2_iwb7UkfmJgDMKanS-QOa1_r7oMiRLaP7sgJyv9RUeMzA/exec';

async function run() {
  const chunkSize = 100;
  console.log(`Toplam ${products.length} ürün ${Math.ceil(products.length / chunkSize)} parça halinde yüklenecek...`);

  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    console.log(`[${i + 1}-${Math.min(i + chunkSize, products.length)}] Arası yükleniyor...`);
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ action: 'BULK_ADD', products: chunk }),
        headers: { 'Content-Type': 'text/plain' }
      });
      const text = await res.text();
      console.log('Yanıt:', text);
    } catch (err) {
      console.error('Hata oluştu, tekrar deneniyor...', err.message);
      i -= chunkSize; // Tekrar dene
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.log('TÜM YÜKLEME TAMAMLANDI! 🎉');
}
run();
