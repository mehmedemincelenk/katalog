/**
 * STORE UTILS
 * -----------------------------------------------------------
 * SaaS mimarisinde aktif dükkanı URL'den veya çevreden çözer.
 */

export const getActiveStoreSlug = (): string => {
  if (typeof window === 'undefined') return 'main-site';

  const hostname = window.location.hostname.toLowerCase();
  
  // 1. Yerel geliştirme (localhost)
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.')
  ) {
    const envSlug = import.meta.env.VITE_STORE_SLUG;
    return (envSlug && envSlug !== 'toptan-ambalajcim') ? envSlug : 'toptanambalajcim';
  }

  // 2. Ana Domain Kontrolü (ekatalog.site veya www.ekatalog.site)
  // Sadece iki parça varsa (ekatalog.site) veya üç parça olup başı www ise
  const parts = hostname.split('.');
  
  if (parts.length <= 2 || (parts.length === 3 && parts[0] === 'www')) {
    return 'main-site';
  }

  // 3. SaaS Subdomain (musteri.ekatalog.site)
  return parts[0]; 
};
