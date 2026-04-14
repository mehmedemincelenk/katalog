/**
 * DEFAULT COMPANY SETTINGS
 */
export const DEFAULT_COMPANY = {
  name: "Toptan Ambalajcım",
  tagline: "Ambalajda Güvenilir Çözüm Ortağınız",
  phone: "0555 000 00 00",
  address: "İstoç Ticaret Merkezi, Bağcılar/İstanbul",
  instagramUrl: "https://instagram.com/toptanambalajcim",
  logoEmoji: "📦",
};

/**
 * DEFAULT CAROUSEL DATA
 */
export const CAROUSEL = {
  slides: [
    { id: 1, src: "", bg: "bg-stone-100", label: "Hoş Geldiniz", sub: "En kaliteli ambalaj ürünleri burada." },
    { id: 2, src: "", bg: "bg-stone-200", label: "Hızlı Teslimat", sub: "Siparişleriniz aynı gün kargoda." },
    { id: 3, src: "", bg: "bg-stone-300", label: "Toptan Fiyatlar", sub: "En uygun fiyat garantisiyle." },
  ]
};

export const CATEGORY_ORDER = ["Kargo Kutusu", "Balonlu Naylon", "Bant", "Poşet", "Diğer"];

export const REFERENCES = [
  { id: 1, name: 'PTT KARGO', logo: '📮' },
  { id: 2, name: 'TRENDYOL', logo: '🧡' },
  { id: 3, name: 'HEPSİBURADA', logo: '💙' },
  { id: 4, name: 'YURTİÇİ KARGO', logo: '🚛' },
];

export const TECH = {
  adminTriggerClicks: 3,
  adminResetDelay: 2000,
  searchDebounceMs: 300,
  auth: {
    sessionActiveValue: 'authorized_admin_active',
    pinLength: 4,
  },
  carousel: {
    intervalMs: 5000,
    swipeThreshold: 50,
  },
  category: {
    desktopThreshold: 6,
  },
  discount: {
    min: 1,
    max: 99,
    errorResetMs: 3000,
  },
  products: {
    defaultCategory: 'Diğer',
    defaultPrice: '0',
    fallbackCategory: 'KATEGORİSİZ / DİĞER',
    maxFileNameLength: 30,
    uniqueIdSuffixLength: 5,
  },
  storage: {
    bucket: 'product-images',
    heroFolder: 'hero',
    lqFolder: 'lq',
    hqFolder: 'hq',
    cacheControl: '0',
    heroWidth: 1600,
    productHqWidth: 1200,
    productLqWidth: 400,
    hqQuality: 0.85,
    lqQuality: 0.5,
    placeholderEmoji: '📦',
  },
  commerce: {
    locale: 'tr-TR',
    currency: 'TRY',
    currencySymbol: '₺',
  }
};

export const STORAGE = {
  productsCache: 'toptanambalaj_products_v13_final',
  categoryOrder: 'toptanambalaj_order_v13',
  carouselSlides: 'toptanambalaj_carousel_v13',
  adminSession: 'admin_session_v13',
};
