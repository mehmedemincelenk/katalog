// ============================================================
// GİRİŞİMCİ KONTROL PANELİ (MERKEZ KONFİGÜRASYON)
// ============================================================
/**
 * KURUCU NOTU:
 * Bu dosya senin sitenin "Anayasası" ve "Kumanda Masası"dır.
 * Bir değeri değiştirdiğinde tüm site saniyeler içinde o kurala uyar.
 * Teknik bilgi gerekmez, sadece tırnak içindeki metinleri veya sayıları değiştirmen yeterlidir.
 */

// ----- 1. ŞİRKET BİLGİLERİ -----
export const COMPANY = {
  name: 'Toptan Ambalajcım',
  tagline: 'ÖMER KÖSE',
  phone: '+90 537 342 0161',
  whatsappUrl: 'https://wa.me/905373420161',
  instagramUrl: 'https://www.instagram.com/toptanambalajcim',
  address: 'Mahmutbey Cd. No:10, Yenibosna / İstanbul',
  email: 'info@toptanambalajcim.com',
  logoEmoji: '📦',
};

// ----- 2. TASARIM VE YERLEŞİM AYARLARI (UI/UX) -----
export const UI = {
  colors: {
    primary: 'kraft-600',
    primaryDark: 'kraft-700',
    adminBg: 'amber-50',
    adminBorder: 'amber-200',
    error: 'red-600',
    success: 'green-600',
  },
  grid: {
    cols: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    gap: 'gap-2',
    sectionMargin: 'mb-12',
  },
  layout: {
    bodyBg: 'bg-stone-50',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
    adminLimit: 999,
  },
  category: {
    initialVisible: 3,
    desktopThreshold: 8,
  },
};

// ----- 3. METİNLER VE ETİKETLER (DİL) -----
export const LABELS = {
  searchPlaceholder: 'Ürün ara…',
  loadMoreBtn: 'Daha Fazla Ürün Göster ↓',
  allProductsLoaded: 'Tüm Ürünler Listelendi',
  noProductsFound: 'Aradığınız kriterde ürün bulunamadı.',
  noProductsAdmin: 'Henüz hiç ürün eklenmemiş. Yukarıdaki butonu kullanarak başlayın.',
  productCountSuffix: 'ÜRÜN',
  adminModeActive: 'ADMİN',
  adminCloseBtn: 'ADMİNİ KAPAT',
  newProductBtn: 'Yeni Ürün Yükle',
  deleteConfirm: 'Bu ürünü silmek istediğinize emin misiniz?',
  catDeleteConfirm: (cat: string) => `${cat} reyonunu silmek istediğinize emin misiniz?`,
  backBtn: 'GERİ',
  saveError: 'Görsel işlenirken bir hata oluştu.',
  discount: {
    invalidRate: 'Geçersiz indirim oranı!',
    invalidCode: 'Geçersiz kod!',
  },
  storage: {
    quotaExceeded: 'LocalStorage doldu! Veri kaydedilemedi.',
    quotaAlert: 'Tarayıcı hafızası dolu olduğu için verileriniz kaydedilemedi. Lütfen tarayıcı verilerini temizleyin.',
    readError: (key: string) => `LocalStorage okuma hatası "${key}":`,
  },
  form: {
    stockStatus: 'Stok Durumu',
    productName: 'Ürün Adı *',
    productNamePlaceholder: 'örn. Kraft Kargo Kutusu (M)',
    category: 'Kategori *',
    newCategoryPlaceholder: 'Veya yeni kategori yazın...',
    price: 'Fiyat *',
    pricePlaceholder: 'örn. ₺4,90',
    description: 'Açıklama',
    descriptionPlaceholder: 'Her satır ayrı bir madde olur...',
    requiredFieldsError: 'Lütfen zorunlu alanları doldurun.',
    cancelBtn: 'İptal',
    submitBtn: 'Ekle',
    selectImage: 'Resim Seç',
    preview: 'Önizleme',
  },
  filter: {
    allCategories: 'Tümü',
    categoryBtn: '📂 Kategoriler',
    showMore: (count: number) => `+${count} Daha`,
    showLess: ' Daha Az',
    newCategoryPrompt: 'Yeni kategori adı girin:',
  },
  adminActions: {
    delete: 'SİL',
    publish: 'YAYINLA',
    archive: 'ARŞİVLE',
    outOfStock: 'TÜKENDİ',
    inStock: 'STOK',
    categories: 'KATEGORİLER',
    addDescription: '+ Açıklama ekle',
    confirmDelete: 'Silinsin mi?',
  }
};

// ----- 4. TEKNİK AYARLAR (Performans & Limitler) -----
export const TECH = {
  searchDebounceMs: 300,
  adminTriggerClicks: 7,
  adminResetDelay: 2000,
  image: {
    productSize: 250,
    modalUploadSize: 400,
    heroSize: 1200,
    quality: 0.6,
    uploadQuality: 0.7,
    sheetCellLimit: 32000,
    placeholderEmoji: '📦',
    qualityFallback: 0.4,
    criticalQualityFallback: 0.3,
    charLimitWarning: 30000,
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
  },
  sheetActions: {
    add: 'ADD',
    update: 'UPDATE',
    delete: 'DELETE',
    reorderProducts: 'UPDATE_PRODUCT_ORDER',
    reorderCategories: 'UPDATE_CATEGORY_ORDER',
    renameCategory: 'RENAME_CATEGORY',
    deleteCategory: 'DELETE_CATEGORY',
    deleteAll: 'DELETE_ALL',
  }
};

// ----- 5. AFİŞ (CAROUSEL) AYARLARI -----
export const CAROUSEL = {
  intervalMs: 4000,
  swipeThreshold: 50,
  boxBg: 'bg-black/25 backdrop-blur-md',
  boxRounding: 'rounded-md',
  boxPaddingMobile: 'p-2',
  boxPaddingPC: 'sm:p-5',
  titleColor: 'text-white',
  subColor: 'text-white/90',
  titleSizeMobile: 'text-[12px]',
  titleSizePC: 'sm:text-xl lg:text-2xl',
  titleWeight: 'font-extrabold',
  subSizeMobile: 'text-[10px]',
  subSizePC: 'text-[12px]',
  navBtnStyle: 'absolute top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-all active:scale-90 backdrop-blur-sm',
  navBtnLeft: 'left-4',
  navBtnRight: 'right-4',
  // Tasarım Ölçüleri
  heightMobile: 'h-64',
  heightTablet: 'sm:h-80',
  heightPC: 'lg:h-96',
  containerWidth: 'mx-auto max-w-7xl',
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  containerMargin: 'mt-4',
  roundedClass: 'rounded-md',
  // Slayt İndikatörleri
  dotPosition: 'bottom-3',
  dotGap: 'gap-1.5',
  dotSize: 'w-2 h-2',
  dotActive: 'bg-white scale-125',
  dotInactive: 'bg-white/50',
  
  slides: [
    {
      id: 1,
      src: 'https://images.pexels.com/photos/1797428/pexels-photo-1797428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bg: 'bg-stone-800',
      label: 'Geniş Depo, Hazır Stok',
      sub: 'Aynı gün sevkiyat, minimum sipariş yok.',
    },
    {
      id: 2,
      src: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bg: 'bg-kraft-800',
      label: 'Her Ölçü, Her Materyal',
      sub: 'Kargo kutusundan streç filme, her ambalaj bizde.',
    },
    {
      id: 3,
      src: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bg: 'bg-stone-700',
      label: "İstoç'tan Bile Ucuz!",
      sub: 'Toptan fiyata perakende kolaylığı.',
    },
  ],
};

// ----- 6. REYON SIRALAMASI -----
export const CATEGORY_ORDER = [
  'TURŞU VE GIDA ÇEŞİTLERİ',
  'BAHARAT GRUBU',
  'PEÇETE',
  'KÖPÜK',
  'KAĞIT',
  'PLASTİK ÜRÜNLERİ VE SIZDIRMAZ GRUBU',
  'STREÇ ÇEŞİTLERİ',
  'ALÜMİNYUM ÇEŞİTLERİ',
  'POŞET ÇEŞİTLERİ',
  'DETERJAN',
  'HİJYEN SARF MALZEMELERİ',
];

export const sortCategories = (cats: string[], custom = CATEGORY_ORDER): string[] => {
  return [...cats].sort((a, b) => {
    let iA = custom.indexOf(a);
    let iB = custom.indexOf(b);
    if (iA === -1) iA = 999;
    if (iB === -1) iB = 999;
    return iA === iB ? a.localeCompare(b) : iA - iB;
  });
};

// ----- 7. REFERANSLAR -----
export const REFERENCES = [
  { id: 1, name: 'PTT Kargo', logo: '🟡' },
  { id: 2, name: 'MNG Kargo', logo: '🔴' },
  { id: 3, name: 'Yurtiçi Kargo', logo: '🟠' },
  { id: 4, name: 'Aras Kargo', logo: '🟣' },
  { id: 5, name: 'UPS', logo: '🟤' },
  { id: 6, name: 'DHL', logo: '⚫' },
  { id: 7, name: 'Trendyol', logo: '🟧' },
  { id: 8, name: 'Hepsiburada', logo: '🟥' },
];

export const REFERENCES_UI = {
  title: 'Referanslarımız & Çalıştığımız Kurumlar',
  style: {
    sectionBg: 'bg-stone-50',
    sectionPadding: 'py-10',
    gridGap: 'gap-4',
    cardBg: 'bg-white',
    cardBorder: 'border-stone-200',
    cardHover: 'hover:border-stone-400',
  }
};

// ----- 8. NAVBAR AYARLARI -----
export const NAVBAR = {
  style: {
    bg: 'bg-white',
    border: 'border-b border-stone-200',
    sticky: 'sticky top-0 z-50 shadow-sm',
  },
  logo: {
    emojiSize: 'text-[20px]',
    nameSize: 'text-[12px]',
    nameWeight: 'font-bold',
    taglineSize: 'text-[10px]',
    taglineColor: 'text-kraft-600',
  },
  contact: {
    phoneSize: 'text-[9px] sm:text-[11px]',
    phoneWeight: 'font-semibold',
    whatsappBg: 'bg-stone-900',
    whatsappHover: 'hover:bg-stone-800',
    whatsappRounded: 'rounded',
    whatsappIconSize: 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5',
    instaIconSize: 'w-4 h-4 sm:w-5 sm:h-5',
    instaColor: 'text-stone-900',
    instaHover: 'hover:text-pink-600',
  },
  address: {
    size: 'text-[8px] sm:text-[11px]',
    color: 'text-stone-600',
    hoverColor: 'hover:text-stone-900',
    separator: 'hidden sm:block w-px h-4 bg-stone-300 mx-2',
  }
};

// ----- 9. ÜRÜN KARTI TİPOGRAFİSİ -----
export const CARD_STYLE = {
  nameSize: 'text-[10px] sm:text-[13px]',
  nameWeight: 'font-semibold',
  nameColor: 'text-stone-900',
  nameLeading: 'leading-snug',
  priceSize: 'text-[12px] sm:text-[15px]',
  priceWeight: 'font-bold',
  priceColor: 'text-stone-900',
  discountColor: 'text-blue-600',
  descSize: 'text-[9px] sm:text-[11px]',
  descColor: 'text-stone-500',
  descLeading: 'leading-tight',
  descMaxH: 'max-h-[36px] sm:max-h-[44px]',
  adminEditBg: 'bg-amber-50',
  adminEditBorder: 'border-amber-200',
  statusIcons: {
    outOfStock: '∅',
    archived: '📦'
  }
};

// ----- 10. FOOTER AYARLARI -----
export const FOOTER = {
  labels: {
    locationTitle: 'LOKASYON',
    advantageTitle: 'AVANTAJ',
    couponActive: 'KUPON AKTİF',
    couponPlaceholder: 'KUPON KODU',
    discountApplied: (rate: number) => `İndirim Uygulandı: %${Math.round(rate * 100)}`,
    codeLabel: (code: string) => `Kod: ${code}`,
    rightsReserved: (name: string) => `© ${new Date().getFullYear()} ${name}. Tüm hakları saklıdır.`,
  },
  style: {
    sectionGap: 'gap-10 md:gap-4',
    tracking: 'tracking-[0.2em]',
    mapBaseUrl: 'https://maps.google.com/?q=',
  }
};

// ----- 11. ANİMASYON VE GEÇİŞ SÜRELERİ -----
export const ANIMATIONS = {
  carouselFade: '0.8s',
  adminPulse: '2s',
  marqueeScroll: '6s',
  descriptionScroll: '5s',
};

// ----- 12. MODAL (PENCERE) TASARIMI -----
export const MODAL = {
  bgClass: 'bg-white',
  maxWidthClass: 'max-w-sm',
  roundingClass: 'rounded-xl',
  shadowClass: 'shadow-2xl',
  overlayBg: 'bg-black/50',
};

// ----- 13. DEPOLAMA (STORAGE) ANAHTARLARI -----
export const STORAGE = {
  productsCache: 'toptanambalaj_products_v13_final', // Versiyon v12 -> v13 (Zorunlu temizlik)
  categoryOrder: 'toptanambalaj_order_v13',
  carouselSlides: 'toptanambalaj_carousel_v13',
  adminSession: 'admin_session_v13',
};
