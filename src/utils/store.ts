/**
 * STORE UTILS
 * -----------------------------------------------------------
 * SaaS mimarisinde aktif dükkanı URL'den veya çevreden çözer.
 */

export const getActiveStoreSlug = (): string => {
  const hostname = window.location.hostname;
  
  // 1. Yerel geliştirme (localhost)
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.')
  ) {
    // ÖNCELİK: Varsa env, yoksa kesinlikle 'toptanambalajcim'
    const envSlug = import.meta.env.VITE_STORE_SLUG;
    return (envSlug && envSlug !== 'toptan-ambalajcim') ? envSlug : 'toptanambalajcim';
  }

  const parts = hostname.split('.');
  
  // 2. Ana Domain Kontrolü (örn: ekatalog.site veya www.ekatalog.site)
  // Eğer subdomain yoksa veya www ise senin ana satış sayfanın slug'ını döner.
  if (parts.length <= 2 || parts[0] === 'www') {
    return 'main-site'; // Buraya kendi tanıtım sayfan için bir slug belirle
  }

  // 3. SaaS Subdomain Kontrolü (örn: musteri1.ekatalog.site)
  // parts: ['musteri1', 'ekatalog', 'site'] -> return 'musteri1'
  return parts[0]; 
};
