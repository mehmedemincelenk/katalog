import BaseFloatingMenu, { FloatingAction } from './BaseFloatingMenu';
import { useStore } from '../store';
import { FloatingAdminMenuProps } from '../types';
import { THEME } from '../data/config';

import * as Lucide from 'lucide-react';

/**
 * FLOATING ADMIN MENU COMPONENT
 * -----------------------------------------------------------
 * Specialized AssistiveTouch hub for store owners.
 * Refined layout: 2x2 grid with spanning top action.
 */
export default function FloatingAdminMenu({
  onProductAddTrigger,
  onBulkUpdateTrigger,
  onSettingsTrigger,
}: FloatingAdminMenuProps) {
  const { settings, updateSetting } = useStore();
  const globalIcons = THEME.icons;

  if (!settings) return null;

  const activeCurrency = settings.activeCurrency;

  const onCurrencyToggle = () => {
    const cycle: Record<string, typeof activeCurrency> = {
      TRY: 'USD',
      USD: 'EUR',
      EUR: 'TRY',
    };
    const next = cycle[activeCurrency] || 'TRY';
    updateSetting('activeCurrency', next);
  };

  const adminActions: FloatingAction[] = [
    // TOP ROW: SPANNING ACTION
    ...(onBulkUpdateTrigger
      ? [
          {
            id: 'bulk',
            icon: <div className="w-6 h-6 flex items-center justify-center text-stone-900">{globalIcons.bulkPrice}</div>,
            action: onBulkUpdateTrigger,
            label: 'TOPLU İŞLEM',
            className: 'bg-white text-stone-900 border-2 border-stone-100 w-full !col-span-2 !rounded-lg mb-1',
            primary: true
          },
        ]
      : []),
    
    // ICON GRID ACTIONS (2x2 Auto-layout)
    {
      id: 'add',
      icon: <div className="w-6 h-6 flex items-center justify-center">{globalIcons.plus}</div>,
      action: onProductAddTrigger,
      label: '', 
      primary: true,
    },
    {
      id: 'social',
      icon: <div className="w-6 h-6 flex items-center justify-center"><Lucide.Image size={24} /></div>,
      action: () => useStore.getState().openModal('SOCIAL_EXPORT'),
      label: '',
      className: 'bg-white text-stone-900 border-2 border-stone-100',
    },
    {
      id: 'currency',
      icon: (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[20px] font-medium leading-none text-stone-900">
            {activeCurrency === 'TRY' ? '₺' : activeCurrency === 'USD' ? '$' : '€'}
          </span>
        </div>
      ),
      action: onCurrencyToggle,
      label: '',
      className: 'bg-white text-stone-900 border-2 border-stone-100',
      closeOnClick: false,
    },
    {
      id: 'settings',
      icon: <div className="w-6 h-6 flex items-center justify-center">{globalIcons.settings}</div>,
      action: onSettingsTrigger,
      label: '', 
      className: 'bg-white text-stone-900 border-2 border-stone-100',
    },
  ];

  return (
    <BaseFloatingMenu 
      actions={adminActions} 
      autoCloseDelay={5000}
      mainIcon={globalIcons.settings}
      labelText="AYARLAR"
    />
  );
}
