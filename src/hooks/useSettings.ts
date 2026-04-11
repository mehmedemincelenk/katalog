import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_COMPANY, STORAGE } from '../data/config';

export interface CompanySettings {
  whatsapp: string;
  address: string;
  instagram: string;
  title: string;
  subtitle: string;
  name: string;
  logoEmoji: string;
}

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;

export function useSettings(isAdmin: boolean) {
  const [settings, setSettings] = useState<CompanySettings>({
    whatsapp: DEFAULT_COMPANY.phone,
    address: DEFAULT_COMPANY.address,
    instagram: DEFAULT_COMPANY.instagramUrl,
    title: DEFAULT_COMPANY.name,
    subtitle: DEFAULT_COMPANY.tagline,
    name: DEFAULT_COMPANY.name,
    logoEmoji: DEFAULT_COMPANY.logoEmoji,
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', STORE_SLUG)
      .single();

    if (data && !error) {
      setSettings({
        whatsapp: data.phone || DEFAULT_COMPANY.phone,
        address: data.address || DEFAULT_COMPANY.address,
        instagram: data.instagram_url || DEFAULT_COMPANY.instagramUrl,
        title: data.name || DEFAULT_COMPANY.name,
        subtitle: data.tagline || DEFAULT_COMPANY.tagline,
        name: data.name || DEFAULT_COMPANY.name,
        logoEmoji: data.logo_url || DEFAULT_COMPANY.logoEmoji,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: keyof CompanySettings, value: string) => {
    // Yerel state'i hemen güncelle (Optimistic Update)
    setSettings(prev => ({ ...prev, [key]: value }));

    if (isAdmin) {
      const payload: any = {};
      if (key === 'whatsapp') payload.phone = value;
      if (key === 'address') payload.address = value;
      if (key === 'instagram') payload.instagram_url = value;
      if (key === 'name' || key === 'title') payload.name = value;
      if (key === 'subtitle') payload.tagline = value;
      if (key === 'logoEmoji') payload.logo_url = value;

      const { error } = await supabase
        .from('stores')
        .update(payload)
        .eq('slug', STORE_SLUG);

      if (error) {
        console.error('Update setting error', error);
        // Hata durumunda eski veriyi geri çekebiliriz
        fetchSettings();
      }
    }
  }, [isAdmin, fetchSettings]);

  return { settings, updateSetting, loading };
}
