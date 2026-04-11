import { useState, useCallback } from 'react';
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

export function useSettings(isAdmin: boolean) {
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const cached = localStorage.getItem(STORAGE.productsCache + '_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Hata durumunda varsayılanlara dön
      }
    }
    return {
      whatsapp: DEFAULT_COMPANY.phone,
      address: DEFAULT_COMPANY.address,
      instagram: DEFAULT_COMPANY.instagramUrl,
      title: DEFAULT_COMPANY.name,
      subtitle: DEFAULT_COMPANY.tagline,
      name: DEFAULT_COMPANY.name,
      logoEmoji: DEFAULT_COMPANY.logoEmoji,
    };
  });

  const loading = false;

  const updateSetting = useCallback(async (key: keyof CompanySettings, value: string) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE.productsCache + '_settings', JSON.stringify(next));
      return next;
    });

    if (isAdmin) {
      const url = import.meta.env.VITE_SHEET_SCRIPT_URL;
      if (!url) return;
      try {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'UPDATE_SETTINGS', key, value }),
        });
      } catch (e) {
        console.error('Update setting error', e);
      }
    }
  }, [isAdmin]);

  return { settings, updateSetting, loading };
}
