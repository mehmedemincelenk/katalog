// FILE ROLE: SaaS Store Resolver (Subdomain & Environment Logic)
// CONSUMED BY: useProducts, useSettings, useAdminMode, Navbar
/**
 * STORE UTILS
 * -----------------------------------------------------------
 * SaaS mimarisinde aktif dükkanı URL'den veya çevreden çözer.
 */

export const getActiveStoreSlug = (): string => {
  if (typeof window === 'undefined') return 'main-site';

  const hostname = window.location.hostname.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);

  // EĞER URL'de ?main=1 VARSA ANA SAYFAYI GÖSTER (Debug/Preview için)
  if (urlParams.get('main') === '1') {
    return 'main-site';
  }
  
  // 1. Yerel geliştirme (localhost, LAN veya DEV modu)
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.') ||
    hostname.startsWith('10.') ||
    import.meta.env.DEV
  ) {
    let envSlug = import.meta.env.VITE_STORE_SLUG;
    
    // Tireleri her durumda temizle (toptan-ambalajcim -> toptanambalajcim)
    if (envSlug) {
      envSlug = envSlug.replace(/-/g, '');
    }

    const finalSlug = (envSlug && envSlug !== 'mainsite') ? envSlug : 'toptanambalajcim';
    return finalSlug;
  }

  // 2. Ana Domain Kontrolü (ekatalog.site veya www.ekatalog.site)
  const parts = hostname.split('.');
  
  if (parts.length <= 2 || (parts.length === 3 && parts[0] === 'www')) {
    return 'main-site';
  }

  // 3. SaaS Subdomain (musteri.ekatalog.site)
  return parts[0]; 
};
