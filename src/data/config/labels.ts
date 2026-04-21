// FILE: src/data/config/labels.ts
// ROLE: Centralized dictionary for hardcoded UI text, error messages, and prompt strings
// READS FROM: None
// USED BY: Nearly every UI component and hook displaying messages to users

// ARCHITECTURE: LABELS
// PURPOSE: A single source of truth for all text content, making it easier to maintain tone or support internationalization later
// DEPENDENCIES: None
// CONSUMERS: Hooks (error messages), Components (UI text, placeholders, alerts)
export const LABELS = {
  storeName: "Toptan Ambalajcım",
  adminModeActive: "Admin Modu Aktif",
  newProductBtn: "Yeni Ürün Ekle",
  loadMoreBtn: "Daha Fazla Ürün",
  allProductsLoaded: "Tüm Ürünler Gösteriliyor",
  deleteConfirm: "Bu ürünü silmek istediğinize emin misiniz?",
  saveError: "Kaydedilirken bir hata oluştu.",
  backBtn: "Geri Dön",
  noProductsFound: "Aradığınız kriterlerde ürün bulunamadı.",
  noProductsAdmin: "Mağazada henüz ürün yok. Hemen yeni bir ürün ekleyerek başlayın!",
  productCountSuffix: "ÜRÜN",
  referencesTitle: "GÜVENİLİR İŞ ORTAKLARIMIZ",
  catDeleteConfirm: (cat: string) => `"${cat}" kategorisini silmek istediğinize emin misiniz? Bu işlem ürünleri silmez, sadece bu kategoriyi kaldırır.`,
  pinModal: {
    cancelLabel: "Vazgeç",
  },
  discount: {
    invalidRate: "Geçersiz indirim oranı!",
    invalidCode: "Geçersiz kod!",
    applied: (rate: number) => `%${rate * 100} İndirim Uygulandı`,
    codeLabel: (code: string) => `Kod: ${code}`,
  },
  errors: {
    adminPinNotFound: "Yönetici şifresi veritabanında bulunamadı.",
    genericUpdate: "Güncelleme sırasında bir hata oluştu.",
    imageLoad: "Resim dosyası açılamadı.",
    fileRead: "Dosya okuma hatası.",
  },
  storage: {
    readError: (key: string) => `"${key}" verisi okunurken bir hata oluştu.`,
    quotaExceeded: "Tarayıcı depolama alanı doldu! Lütfen bazı verileri temizleyin.",
    quotaAlert: "Depolama kotası aşıldı. Yaptığınız değişiklikler yerel olarak kaydedilemeyebilir.",
  },
  filter: {
    categoryBtn: "KATEGORİLER",
    showLess: "Daha Az Göster",
    showMore: (count: number) => `+${count} Daha`,
    newCategoryPrompt: "Yeni kategori adını girin:",
    searchPlaceholder: "Ürün veya reyon ara...",
    allCategories: "Tüm Ürünler",
  },
  form: {
    productName: "Ürün Adı",
    productNamePlaceholder: "Örn: Kargo Kutusu 20x20",
    category: "Reyon Seçin",
    newCategoryPlaceholder: "Veya yeni reyon adı yazın...",
    price: "Fiyat",
    pricePlaceholder: "Örn: ₺12,50",
    description: "Short description (Optional)",
    descriptionPlaceholder: "Ürün detaylarını buraya yazın...",
    stockStatus: "Stokta Var",
    selectImage: "Fotoğraf Seç",
    preview: "Önizleme",
    requiredFieldsError: "Lütfen zorunlu alanları doldurun.",
    cancelBtn: "İptal",
    submitBtn: "Mağazaya Ekle",
  },
  bulkPriceUpdate: {
    title: "Toplu Fiyat Güncelleme",
    description: "Reyon seç, miktarı yaz (10 veya %10), zam mı indirim mi karar ver ve onayla. Tüm fiyatlar anında güncellensin!",
    categoryLabel: "KATEGORİ SEÇİMİ (Seçilmezse Tümü)",
    valueLabel: "MİKTAR VEYA YÜZDE (Örn: 10 veya %10)",
    increaseBtn: "ZAM YAP 📈",
    decreaseBtn: "İNDİRİM YAP 📉",
    submitBtn: "DEĞİŞİKLİKLERİ UYGULA",
    processingBtn: "İŞLENİYOR...",
    invalidValue: "Lütfen geçerli bir tutar veya yüzde giriniz.",
    noProducts: "Seçili kriterlere uygun ürün bulunamadı.",
    confirm: (catCount: number, productCount: number, isIncrease: boolean) => 
      `${catCount === 0 ? 'Tüm kategorilerdeki' : `${catCount} kategorideki`} toplam ${productCount} ürünün fiyatı ${isIncrease ? 'artırılacak' : 'azaltılacak'}. Onaylıyor musunuz?`,
  },
  adminActions: {
    categories: "Reyon Değiştir",
    inStock: "Stokta Var",
    outOfStock: "Stokta Yok",
    archive: "Arşivle",
    publish: "Yayına Al",
    delete: "Ürünü Sil",
    confirmDelete: "Bu ürünü kalıcı olarak silmek istiyor musunuz?",
    addDescription: "+ Açıklama Ekle",
    confirmDeleteAll: "Tüm ürünler silinecek. Emin misiniz?",
  },
  carousel: {
    changeImageHint: "📸",
    prevAria: "Önceki Afiş",
    nextAria: "Sonraki Afiş",
    dotAria: (index: number) => `${index + 1}. afişe git`,
  },
  locationTitle: "KONUMUMUZ",
  advantageTitle: "AVANTAJLAR",
  couponPlaceholder: "KUPON KODU GİRİN",
  couponActive: "KUPON UYGULANDI",
  rightsReservedText: "Tüm Hakları Saklıdır.",
  discountApplied: (rate: number) => `%${rate * 100} İndirim Uygulandı`,
  codeLabel: (code: string) => `Kod: ${code}`,
};
