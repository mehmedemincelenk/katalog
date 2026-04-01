// ============================================================
// MERKEZ KONFİGÜRASYON — tüm sabit veriler burada tutulur
// ============================================================

// ----- Şirket -----
export const COMPANY = {
  name:         'Toptan Ambalajcım',   // Marka adı
  tagline:      'Katalog',             // Navbar altı etiket
  phone:        '+90 212 000 00 00',   // Telefon numarası
  whatsappUrl:  'https://wa.me/902120000000', // WhatsApp doğrudan bağlantı
  address:      'Rami Kışla Cd. No:7, Eyüpsultan / İstanbul', // Açık adres
  email:        'info@toptanambalajcim.com',  // E-posta
  logoEmoji:    '📦',                  // Logo sembolü
};

// ----- Navbar -----
export const NAVBAR = {
  heightClass:      'h-14',                     // Bar yüksekliği
  bgClass:          'bg-white',                 // Arka plan
  borderClass:      'border-b border-stone-200',// Alt çizgi
  shadowClass:      'shadow-sm',                // Gölge yoğunluğu
  // Logo
  logoEmojiSize:    'text-[20px]',              // Emoji boyutu
  logoNameSize:     'text-[14px]',              // Marka adı boyutu
  logoNameWeight:   'font-bold',                // Marka adı kalınlığı
  logoTaglineSize:  'text-[10px]',              // Tagline boyutu
  logoTaglineColor: 'text-kraft-600',           // Tagline rengi
  // Telefon & WhatsApp kombinasyon butonu
  phoneSize:        'text-[11px]',              // Telefon yazı boyutu
  phoneWeight:      'font-semibold',            // Telefon yazı kalınlığı
  phoneColor:       'text-stone-900',           // Telefon yazı rengi
  phoneHoverColor:  'hover:text-kraft-700',     // Telefon hover rengi
  whatsappBtnSize:  'w-6 h-6',                 // Buton kare boyutu
  whatsappIconSize: 'w-3.5 h-3.5',             // İkon boyutu
  whatsappBg:       'bg-stone-900',             // Buton arka planı
  whatsappHoverBg:  'hover:bg-stone-900',       // Buton hover arka planı
  whatsappRounded:  'rounded',                  // Köşe yuvarlama
  // Adres
  addressSize:      'text-[10px]',              // Adres yazı boyutu
  addressColor:     'text-stone-600',           // Adres yazı rengi
};

// ----- Admin Modu -----
export const ADMIN = {
  triggerClicks: 7,     // Kaç tıkla admin açılır (footer logosu)
  resetDelayMs:  2000,  // Tık sayacı sıfırlama süresi (ms)
};

// ----- Veri Depolama -----
export const STORAGE_KEY = 'toptanambalaj_products'; // localStorage anahtarı

// ----- Carousel -----
export const CAROUSEL = {
  intervalMs:    1000,          // Slayt geçiş süresi (ms)
  roundedClass: 'rounded-xl',  // Köşe yuvarlama
  slides: [
    {
      id:    1,
      src:   null,              // Resim yolu — örn. '/carousel/depo.jpg'
      bg:    'bg-stone-800',
      label: 'Geniş Depo, Hazır Stok',
      sub:   'Aynı gün sevkiyat, minimum sipariş yok.',
    },
    {
      id:    2,
      src:   null,
      bg:    'bg-kraft-800',
      label: 'Her Ölçü, Her Materyal',
      sub:   'Kargo kutusundan streç filme, her ambalaj bizde.',
    },
    {
      id:    3,
      src:   null,
      bg:    'bg-stone-700',
      label: "İstoç'tan Bile Ucuz!",
      sub:   'Toptan fiyata perakende kolaylığı.',
    },
  ],
};

// ----- Ürün Grid -----
export const GRID = {
  colsClass: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6', // Sütun sayısı
  gapClass:  'gap-4',                                      // Kart arası boşluk
};

// ----- Varsayılan Ürünler (localStorage boşsa yüklenir) -----
export const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Kraft Kargo Kutusu (M)', category: 'Kargo Kutuları',    price: '₺4,90',  image: null, description: '5 katlı mikrooluklu\n40x30x30 cm\n10 adet/koli' },
  { id: 2, name: 'Bant – Şeffaf 75m',      category: 'Bantlar',           price: '₺2,50',  image: null, description: '48mm genişlik\n75m uzunluk\nGüçlü yapışkanlı' },
  { id: 3, name: 'Baloncuklu Zarf (A4)',    category: 'Zarflar',           price: '₺3,20',  image: null, description: 'A4 boyut\nÇift taraflı kilitli\n25 adet/paket' },
  { id: 4, name: 'Streç Film Rulo 500m',    category: 'Streç Film',        price: '₺28,00', image: null, description: '500m uzunluk\n23 mikron kalınlık\nManuel kullanım' },
  { id: 5, name: 'Köpük Şerit 10mm',       category: 'Dolgu Malzemeleri', price: '₺6,70',  image: null, description: '10mm kalınlık\n50mm genişlik\n5m/rulo' },
  { id: 6, name: 'Kraft Kargo Kutusu (L)', category: 'Kargo Kutuları',    price: '₺6,50',  image: null, description: '5 katlı mikrooluklu\n50x40x40 cm\n5 adet/koli' },
];

// ----- Referans Logoları -----
export const REFERENCES = [
  { id: 1, name: 'PTT Kargo',     logo: '🟡' },
  { id: 2, name: 'MNG Kargo',     logo: '🔴' },
  { id: 3, name: 'Yurtiçi Kargo', logo: '🟠' },
  { id: 4, name: 'Aras Kargo',    logo: '🟣' },
  { id: 5, name: 'UPS',           logo: '🟤' },
  { id: 6, name: 'DHL',           logo: '⚫' },
  { id: 7, name: 'Trendyol',      logo: '🟧' },
  { id: 8, name: 'Hepsiburada',   logo: '🟥' },
];

// ----- Ürün Kartı Tipografisi -----
export const CARD_TYPOGRAPHY = {
  // Kategori chip (resim üstü overlay)
  categoryFontSize:  'text-[8px]',
  categoryWeight:    'font-semibold',
  categoryCase:      'uppercase',
  categoryTracking:  'tracking-wider',
  categoryColor:     'text-kraft-700',
  categoryBg:        'bg-kraft-50',
  categoryBorder:    'border border-kraft-200',
  categoryRounding:  'rounded-md',
  categoryPadding:   'px-1.5 py-0.5',
  // İsim (tek satır, yatay marquee)
  nameFontSize:      'text-[12px]',
  nameWeight:        'font-semibold',
  nameColor:         'text-stone-900',
  nameLeading:       'leading-snug',
  // Fiyat
  priceFontSize:     'text-[16px]',
  priceWeight:       'font-bold',
  priceColor:        'text-stone-900',
  // Açıklama (çok satır, dikey oto-kaydırma)
  descFontSize:      'text-[9px]',
  descColor:         'text-stone-500',
  descLeading:       'leading-tight',
  descMaxHeight:     'max-h-[40px]', // Görünüm: azami yükseklik, taşarsa otomatik kayar
  descAreaHeight:    'h-[40px]',     // Admin textarea sabit yüksekliği
};
