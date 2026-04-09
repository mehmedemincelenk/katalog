import React from 'react';
import { LABELS } from '../data/config';
import FloatingButton from './FloatingButton';

interface BulkActionsPanelProps {
  selectedCount: number;
  categories: string[];
  onCancel: () => void;
  onDelete: () => void;
  onArchiveToggle: () => void;
  onStockToggle: () => void;
  onChangeCategory: (newCategory: string) => void;
  onChangeName: () => void;
  onChangePrice: () => void;
}

export default function BulkActionsPanel({
  selectedCount,
  categories,
  onCancel,
  onDelete,
  onArchiveToggle,
  onStockToggle,
  onChangeCategory,
  onChangeName,
  onChangePrice,
}: BulkActionsPanelProps) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 animate-in slide-in-from-right fade-in duration-300">
      <div className="bg-stone-900 text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl text-center uppercase tracking-widest mb-1 border border-white/20">
        {selectedCount} Seçili
      </div>

      <FloatingButton onClick={onCancel} icon="×" label="İptal" className="font-black text-2xl" />
      
      <FloatingButton onClick={onDelete} icon="🗑️" label={LABELS.adminActions.delete} variant="danger" />
      
      <FloatingButton onClick={onArchiveToggle} icon="📦" label={LABELS.adminActions.archive} />
      
      <FloatingButton onClick={onStockToggle} icon="✅" label={LABELS.adminActions.inStock} />

      <div className="relative">
        <FloatingButton onClick={() => {}} icon="🏷️" label={LABELS.adminActions.categories} />
        <select 
          onChange={(e) => { if(e.target.value) { onChangeCategory(e.target.value); e.target.value = ""; } }}
          value=""
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none z-[5]"
        >
          <option value="" disabled>Kategori Seç...</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <FloatingButton onClick={onChangeName} icon="✏️" label="İsim Değiştir" />
      
      <FloatingButton onClick={onChangePrice} icon="💰" label="Fiyat Değiştir" />
    </div>
  );
}

