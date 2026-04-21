// FILE ROLE: Global Settings & Branding Persistence Hook
// DEPENDS ON: Supabase, Default Config, Currency Utils
// CONSUMED BY: App.tsx, Navbar.tsx, DisplaySettingsModal.tsx
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_COMPANY, CATEGORY_ORDER as DEFAULT_ORDER } from '../data/config';
import { getActiveStoreSlug } from '../utils/store';
import { fetchCurrentRates } from '../utils/currency';

export interface CompanySettings {
  id: string; // Store UUID
  whatsapp: string;
  address: string;
  instagram: string;
  title: string;
  subtitle: string;
  name: string;
  logoUrl: string;
  categoryOrder: string[];
  carouselData: {
    slides: Array<{
      id: number;
      src: string;
      bg: string;
      label: string;
      sub: string;
    }>;
  };
  referencesData: Array<{
    id: number;
    name: string;
    logo: string;
  }>;
  displayConfig: {
    showAddress: boolean;
    showInstagram: boolean;
    showWhatsapp: boolean;
    showReferences: boolean;
    showPrice: boolean;
    showCarousel: boolean;
    showCoupons: boolean;
    showPriceList: boolean;
    showCurrency: boolean;
  };
  announcementBar: {
    enabled: boolean;
    text: string;
  };
  socialProofCards?: string[];
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };
  exchangeRates: {
    usd: number;
    eur: number;
  };
  activeCurrency: 'TRY' | 'USD' | 'EUR';
}

const STORE_SLUG = getActiveStoreSlug();

/**
 * BRANDING & CONFIGURATION ENGINE (useSettings)
 * -----------------------------------------------------------
 * Manages the store's identity and visual rules. Key responsibilities:
 * 1. Identity Management: Store title, logo, address, and social links.
 * 2. Layout Control: Component visibility toggles (DisplayConfig).
 * 3. Dynamic Assets: Management of Hero Carousels and Client References.
 * 4. UX States: Inline editing toggle for the 'vibe coding' experience.
 */
export function useSettings(isAdministrativeModeActive: boolean) {
  const [activeStoreSettings, setActiveStoreSettings] = useState<CompanySettings>({
    id: '',
    whatsapp: DEFAULT_COMPANY.phone,
    address: DEFAULT_COMPANY.address,
    instagram: DEFAULT_COMPANY.instagramUrl,
    title: DEFAULT_COMPANY.name,
    subtitle: DEFAULT_COMPANY.tagline,
    name: DEFAULT_COMPANY.name,
    logoUrl: DEFAULT_COMPANY.logoUrl,
    categoryOrder: DEFAULT_ORDER,
    carouselData: { slides: [] },
    referencesData: [],
    displayConfig: DEFAULT_COMPANY.displayConfig,
    announcementBar: DEFAULT_COMPANY.announcementBar,
    maintenanceMode: DEFAULT_COMPANY.maintenanceMode,
    exchangeRates: { usd: 35, eur: 38 },
    activeCurrency: 'TRY',
  });

  const [isSettingsDataLoading, setIsSettingsDataLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isError, setIsError] = useState(false);

  /**
   * synchronizeStoreSettings: Retrieves remote configuration from Supabase repository.
   */
  const synchronizeStoreSettings = useCallback(async () => {
    // 1. ANA SAYFA KONTROLÜ: Eğer ana sayfadaysak DB'ye gitme
    if (STORE_SLUG === 'main-site') {
      setIsSettingsDataLoading(false);
      return;
    }
    
    const { data: storeConfig, error: fetchError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', STORE_SLUG)
      .single();

    if (fetchError) {
      console.error('Store configuration fetch error:', fetchError);
      if (fetchError.code === 'PGRST116') {
        setIsNotFound(true);
      } else {
        setIsError(true);
      }
      setIsSettingsDataLoading(false);
      return;
    }

    if (!storeConfig) {
      setIsNotFound(true);
      setIsSettingsDataLoading(false);
      return;
    }

    if (storeConfig) {
      setActiveStoreSettings({
        id: storeConfig.id,
        whatsapp: storeConfig.phone || DEFAULT_COMPANY.phone,
        address: storeConfig.address || DEFAULT_COMPANY.address,
        instagram: storeConfig.instagram_url || DEFAULT_COMPANY.instagramUrl,
        title: storeConfig.name || DEFAULT_COMPANY.name,
        subtitle: storeConfig.tagline || DEFAULT_COMPANY.tagline,
        name: storeConfig.name || DEFAULT_COMPANY.name,
        logoUrl: storeConfig.logo_url || DEFAULT_COMPANY.logoUrl,
        categoryOrder: storeConfig.category_order || DEFAULT_ORDER,
        carouselData: storeConfig.carousel_data || { slides: [] },
        referencesData: storeConfig.references_data || [],
        displayConfig: { ...DEFAULT_COMPANY.displayConfig, ...(storeConfig.display_config || {}) },
        announcementBar: storeConfig.announcement_bar || DEFAULT_COMPANY.announcementBar,
        maintenanceMode: storeConfig.maintenance_mode || DEFAULT_COMPANY.maintenanceMode,
        exchangeRates: storeConfig.exchange_rates || { usd: 35, eur: 38 },
        activeCurrency: storeConfig.active_currency || 'TRY',
      });
    }
    setIsSettingsDataLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await synchronizeStoreSettings();
      
      // Auto-fetch fresh rates from internet
      const freshRates = await fetchCurrentRates();
      if (freshRates) {
        // Update local state immediately
        setActiveStoreSettings(prev => ({
          ...prev,
          exchangeRates: { usd: freshRates.usd, eur: freshRates.eur }
        }));
        
        // If in admin mode, we could also persist them, 
        // but for now, keeping them in memory for the session is enough and 'painless'
      }
    };
    init();
  }, [synchronizeStoreSettings]);

  /**
   * modifyStoreConfiguration: Updates specific branding or contact fields.
   * Uses optimistic UI updates for immediate feedback.
   */
  const modifyStoreConfiguration = useCallback(async <K extends keyof CompanySettings>(
    settingKey: K, 
    newValue: CompanySettings[K]
  ) => {
    // Optimistic UI Update: Reflected immediately in the interface
    setActiveStoreSettings(previousSettings => ({ ...previousSettings, [settingKey]: newValue }));

    if (isAdministrativeModeActive) {
      const updatePayload: Record<string, unknown> = {};
      
      // Mapping logic: UI field keys to database column names
      if (settingKey === 'whatsapp') updatePayload.phone = newValue;
      if (settingKey === 'address') updatePayload.address = newValue;
      if (settingKey === 'instagram') updatePayload.instagram_url = newValue;
      if (settingKey === 'name' || settingKey === 'title') updatePayload.name = newValue;
      if (settingKey === 'subtitle') updatePayload.tagline = newValue;
      if (settingKey === 'logoUrl') updatePayload.logo_url = newValue;
      if (settingKey === 'categoryOrder') updatePayload.category_order = newValue;
      if (settingKey === 'referencesData') updatePayload.references_data = newValue;
      if (settingKey === 'displayConfig') updatePayload.display_config = newValue;
      if (settingKey === 'announcementBar') updatePayload.announcement_bar = newValue;
      if (settingKey === 'maintenanceMode') updatePayload.maintenance_mode = newValue;
      if (settingKey === 'exchangeRates') updatePayload.exchange_rates = newValue;
      if (settingKey === 'activeCurrency') updatePayload.active_currency = newValue;

      const { error: persistenceError } = await supabase
        .from('stores')
        .update(updatePayload)
        .eq('slug', STORE_SLUG);

      if (persistenceError) {
        console.error('❌ Supabase Güncelleme Hatası:', persistenceError);
        synchronizeStoreSettings();
      }
    } else {
      console.warn('⚠️ Admin modu aktif olmadığı için Supabase güncellenmedi.');
    }
  }, [isAdministrativeModeActive, synchronizeStoreSettings]);

  return { 
    settings: activeStoreSettings, 
    updateSetting: modifyStoreConfiguration, 
    loading: isSettingsDataLoading,
    notFound: isNotFound,
    isError: isError,
    retry: synchronizeStoreSettings
  };
}
