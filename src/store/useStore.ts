import { create } from 'zustand';
import { CompanySettings } from '../types';

/**
 * STORE / USESTORE.TS (DÜKKANIN ORTAK AKLI)
 * ---------------------------------------
 * Dükkanın tüm global durumlarını (admin modu, ayarlar vb.)
 * merkezi bir yerden yöneten akıllı pano.
 */

import { StoreState } from '../types';

export const useStore = create<StoreState>((set) => ({
  // Admin Modu (Varsayılan kapalı)
  isAdmin: false,
  setIsAdmin: (status) => set({ isAdmin: status }),

  // Dükkan Ayarları
  settings: null,
  setSettings: (settings) => set({ settings }),
  updateSetting: (key, value) =>
    set((state) => ({
      settings: state.settings
        ? ({ ...state.settings, [key]: value } as CompanySettings)
        : null,
    })),

  // Katalog UI Kontrolleri
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeCategories: [],
  toggleCategory: (category) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(category)
        ? state.activeCategories.filter((c) => c !== category)
        : [...state.activeCategories, category],
    })),
  clearCategories: () => set({ activeCategories: [] }),

  visitorCurrency:
    (localStorage.getItem('ekatalog_visitor_currency') as
      | 'TRY'
      | 'USD'
      | 'EUR') || 'TRY',
  toggleVisitorCurrency: () =>
    set((state) => {
      const cycle: Record<string, 'TRY' | 'USD' | 'EUR'> = {
        TRY: 'USD',
        USD: 'EUR',
        EUR: 'TRY',
      };
      const next = cycle[state.visitorCurrency] || 'TRY';
      localStorage.setItem('ekatalog_visitor_currency', next);
      return { visitorCurrency: next };
    }),

  // Promosyonlar
  activeDiscount: null,
  setActiveDiscount: (discount) => set({ activeDiscount: discount }),
}));
