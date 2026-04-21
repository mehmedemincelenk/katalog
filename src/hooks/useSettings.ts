// FILE: src/hooks/useSettings.ts
// ROLE: Manages fetching and updating global store configuration (UI settings, contact info, visual toggles)
// READS FROM: src/lib/supabase, src/data/config, src/utils/store
// USED BY: App.tsx, Navbar, Footer, DisplaySettingsModal, Admin components

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_COMPANY, CATEGORY_ORDER as DEFAULT_ORDER } from '../data/config';
import { getActiveStoreSlug } from '../utils/store';

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
    showLogo: boolean;
    showAddress: boolean;
    showInstagram: boolean;
    showCategories: boolean;
    showSearch: boolean;
    showWhatsapp: boolean;
    showSubtitle: boolean;
    showReferences: boolean;
    showPrice: boolean;
  };
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

// ARCHITECTURE: useSettings
// PURPOSE: Primary hook for loading and saving the current tenant's global store configuration (colors, visibility, branding)
// DEPENDENCIES: supabase, getActiveStoreSlug
// CONSUMERS: Top-level App components or providers needing configuration state
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
      });
    }
    setIsSettingsDataLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await synchronizeStoreSettings();
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
