import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_COMPANY, CATEGORY_ORDER as DEFAULT_ORDER } from '../data/config';

export interface CompanySettings {
  whatsapp: string;
  address: string;
  instagram: string;
  title: string;
  subtitle: string;
  name: string;
  logoEmoji: string;
  categoryOrder: string[];
}

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;

/**
 * USE SETTINGS HOOK (BRANDING & CONFIGURATION ENGINE)
 * -----------------------------------------------------------
 * Manages store-wide settings including contact info, branding assets, and display logic.
 */
export function useSettings(isAdministrativeModeActive: boolean) {
  const [activeStoreSettings, setActiveStoreSettings] = useState<CompanySettings>({
    whatsapp: DEFAULT_COMPANY.phone,
    address: DEFAULT_COMPANY.address,
    instagram: DEFAULT_COMPANY.instagramUrl,
    title: DEFAULT_COMPANY.name,
    subtitle: DEFAULT_COMPANY.tagline,
    name: DEFAULT_COMPANY.name,
    logoEmoji: DEFAULT_COMPANY.logoEmoji,
    categoryOrder: DEFAULT_ORDER,
  });

  const [isSettingsDataLoading, setIsSettingsDataLoading] = useState(true);

  /**
   * synchronizeStoreSettings: Retrieves remote configuration from Supabase repository.
   */
  const synchronizeStoreSettings = useCallback(async () => {
    setIsSettingsDataLoading(true);
    const { data: storeConfig, error: fetchError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', STORE_SLUG)
      .single();

    if (storeConfig && !fetchError) {
      setActiveStoreSettings({
        whatsapp: storeConfig.phone || DEFAULT_COMPANY.phone,
        address: storeConfig.address || DEFAULT_COMPANY.address,
        instagram: storeConfig.instagram_url || DEFAULT_COMPANY.instagramUrl,
        title: storeConfig.name || DEFAULT_COMPANY.name,
        subtitle: storeConfig.tagline || DEFAULT_COMPANY.tagline,
        name: storeConfig.name || DEFAULT_COMPANY.name,
        logoEmoji: storeConfig.logo_url || DEFAULT_COMPANY.logoEmoji,
        categoryOrder: storeConfig.category_order || DEFAULT_ORDER,
      });
    }
    setIsSettingsDataLoading(false);
  }, []);

  useEffect(() => {
    synchronizeStoreSettings();
  }, [synchronizeStoreSettings]);

  /**
   * modifyStoreConfiguration: Updates specific branding or contact fields.
   * Uses optimistic UI updates for immediate feedback.
   */
  const modifyStoreConfiguration = useCallback(async (settingKey: keyof CompanySettings, newValue: any) => {
    // Optimistic UI Update: Reflected immediately in the interface
    setActiveStoreSettings(previousSettings => ({ ...previousSettings, [settingKey]: newValue }));

    if (isAdministrativeModeActive) {
      const updatePayload: any = {};
      
      // Mapping logic: UI field keys to database column names
      if (settingKey === 'whatsapp') updatePayload.phone = newValue;
      if (settingKey === 'address') updatePayload.address = newValue;
      if (settingKey === 'instagram') updatePayload.instagram_url = newValue;
      if (settingKey === 'name' || settingKey === 'title') updatePayload.name = newValue;
      if (settingKey === 'subtitle') updatePayload.tagline = newValue;
      if (settingKey === 'logoEmoji') updatePayload.logo_url = newValue;
      if (settingKey === 'categoryOrder') updatePayload.category_order = newValue;

      const { error: persistenceError } = await supabase
        .from('stores')
        .update(updatePayload)
        .eq('slug', STORE_SLUG);

      if (persistenceError) {
        console.error('Configuration persistence failed:', persistenceError);
        synchronizeStoreSettings(); // Rollback to server state on failure
      }
    }
  }, [isAdministrativeModeActive, synchronizeStoreSettings]);

  return { 
    settings: activeStoreSettings, 
    updateSetting: modifyStoreConfiguration, 
    loading: isSettingsDataLoading 
  };
}
