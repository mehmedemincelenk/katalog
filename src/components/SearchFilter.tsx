import React, { useState, useMemo, memo, useEffect } from 'react';
import { UI, LABELS, TECH, sortCategories } from '../data/config';
import { Product } from '../types';

/**
 * SEARCH FILTER BİLEŞENİ (MÜŞTERİ YOLCULUĞU)
 * ---------------------------------------
 * Bir kurucu olarak bu bileşen senin "Akıllı Rehber"indir.
 * 
 * 1. Keşif Kolaylığı: Müşteri aradığı ürünü saniyeler içinde bulursa satın alma ihtimali artar.
 * 2. Dinamik Filtreleme: Reyonlar (kategoriler) arasında tek tıkla geçiş sağlar.
 * 3. Hız (Debounce): Arama kutusuna her harf yazıldığında sistemi yormaz, yazma bitince sonuçları getirir (Cihaz performansı).
 * 4. Yönetim Gücü: Admin modundayken kategorilerin ismini üzerine tıklayarak değiştirebilir veya sıralarını güncelleyebilirsin.
 */

interface SearchFilterProps {
  products: Product[];
  categoryOrder: string[];
  onCategoryOrderChange: (catName: string, newPosition: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  activeCategories?: string[];
  onCategoryToggle: (cat: string) => void;
  isAdmin: boolean;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategoryFromProducts: (catName: string) => void;
}

// --- YARDIMCI BİLEŞEN: CategoryChip ---
const CategoryChip = memo(({ 
  cat, isSelected, isAdmin, currentIndex, totalCount, productCount, onToggle, onOrderChange, onRename, onDelete 
}: { 
  cat: string, isSelected: boolean, isAdmin: boolean, currentIndex: number, totalCount: number, productCount?: number,
  onToggle: (cat: string) => void, onOrderChange: (catName: string, pos: number) => void,
  onRename: (old: string, newName: string) => void, onDelete: (cat: string) => void
}) => {
  const isActualCategory = cat !== LABELS.filter.allCategories;

  // Kategori ismi düzenleme (Inline Edit)
  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (!isAdmin || !isActualCategory) return;
    const newName = e.currentTarget.textContent?.trim() || '';
    if (newName && newName !== cat) onRename(cat, newName);
    else e.currentTarget.textContent = cat;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); }
  };

  return (
    <div className={`flex items-center rounded-full border transition-all ${
      isSelected ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-105' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500 active:scale-95'
    }`}>
      {/* SIRALAMA SEÇİCİ (Admin) veya SAYI (Müşteri) */}
      {isActualCategory && (
        <div className="flex items-center shrink-0">
          {isAdmin ? (
            <select
              value={currentIndex + 1}
              onChange={(e) => onOrderChange(cat, parseInt(e.target.value, 10))}
              className={`bg-stone-100 text-stone-900 text-[12px] font-black w-9 h-8 p-0 cursor-pointer appearance-none rounded-l-full text-center focus:outline-none`}
            >
              {Array.from({ length: totalCount }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
            </select>
          ) : (
            <span className={`text-[10px] font-black px-2 py-1 rounded-l-full ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
              {productCount || 0}
            </span>
          )}
        </div>
      )}

      <button onClick={() => onToggle(cat)} className={`py-1.5 text-[10px] font-bold whitespace-nowrap flex items-center gap-1.5 ${isActualCategory ? 'pr-3 pl-1.5' : 'px-3'}`}>
        <span
          contentEditable={isAdmin && isActualCategory}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => isAdmin && isActualCategory && e.stopPropagation()}
          className={isAdmin && isActualCategory ? `cursor-text focus:bg-white/20 px-0.5 rounded outline-none` : ''}
        >
          {cat}
        </span>
        {/* SİLME BUTONU (Admin) */}
        {isAdmin && isActualCategory && (
          <span onClick={(e) => { e.stopPropagation(); if(window.confirm(LABELS.catDeleteConfirm(cat))) onDelete(cat); }} className="ml-1 text-red-400 hover:text-red-600 font-bold text-xs">×</span>
        )}
      </button>
    </div>
  );
});

// --- ANA BİLEŞEN ---
export default function SearchFilter({
  products, categoryOrder, onCategoryOrderChange, search, onSearchChange,
  activeCategories = [], onCategoryToggle, isAdmin, renameCategory, removeCategoryFromProducts,
}: SearchFilterProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  // DEBOUNCE: Yazma işlemi bittikten 300ms sonra aramayı tetikler.
  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(localSearch), TECH.searchDebounceMs);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  useEffect(() => { setLocalSearch(search); }, [search]);

  // Kategorileri ve ürün sayılarını hesapla
  const { categories, sortedList, counts } = useMemo(() => {
    const dynamic = [...new Set(products.map((p) => p.category).filter(Boolean))];
    const sorted = sortCategories(dynamic, categoryOrder);
    
    // Her kategori için ürün sayısını hesapla (Arşivlenmemiş olanlar)
    const stats: Record<string, number> = {};
    products.forEach(p => {
      if (!p.is_archived) {
        stats[p.category] = (stats[p.category] || 0) + 1;
      }
    });

    return { 
      sortedList: sorted, 
      categories: [LABELS.filter.allCategories, ...sorted],
      counts: stats
    };
  }, [products, categoryOrder]);

  const visibleCategories = (showAll || isAdmin || isMenuOpen) ? categories : categories.slice(0, UI.category.desktopThreshold);

  return (
    <section className="bg-white border-b border-stone-200 py-3 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        
        {/* ARAMA ALANI */}
        <div className={`flex w-full sm:w-auto items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap ${isAdmin ? 'sm:hidden' : ''}`}>
          <div className="relative flex-1 sm:w-48 min-w-[140px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            <input 
              type="search" 
              value={localSearch} 
              onChange={(e) => setLocalSearch(e.target.value)} 
              placeholder={LABELS.searchPlaceholder} 
              className="w-full pl-9 pr-8 py-2 border border-stone-300 rounded-md text-sm text-stone-900 focus:ring-2 focus:ring-kraft-400 outline-none transition" 
            />
            {localSearch && (
              <button onClick={() => setLocalSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1">×</button>
            )}
          </div>
          {/* Mobil Kategori Seçici */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-100 border border-stone-300 rounded-md text-[10px] font-bold text-stone-700">
            {LABELS.filter.categoryBtn}
          </button>
        </div>

        {/* REYON (KATEGORİ) LİSTESİ */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 items-center flex-1 transition-all w-full`}>
          {visibleCategories.map((cat, idx) => (
            <CategoryChip 
              key={cat} 
              cat={cat} 
              isSelected={cat === LABELS.filter.allCategories ? activeCategories.length === 0 : activeCategories.includes(cat)}
              isAdmin={isAdmin} 
              currentIndex={cat === LABELS.filter.allCategories ? -1 : sortedList.indexOf(cat)} 
              totalCount={sortedList.length}
              productCount={cat === LABELS.filter.allCategories ? products.filter(p => !p.is_archived).length : counts[cat]}
              onToggle={onCategoryToggle} 
              onOrderChange={onCategoryOrderChange} 
              onRename={renameCategory} 
              onDelete={removeCategoryFromProducts}
            />
          ))}
          
          {/* "Daha Fazla" Butonu (Müşteri için) */}
          {categories.length > UI.category.desktopThreshold && !isAdmin && !isMenuOpen && (
            <button onClick={() => setShowAll(!showAll)} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors">
              {showAll ? LABELS.filter.showLess : LABELS.filter.showMore(categories.length - UI.category.desktopThreshold)}
            </button>
          )}

          {/* Yeni Kategori Ekleme (Admin) */}
          {isAdmin && (
            <button 
              onClick={() => { const n = window.prompt(LABELS.filter.newCategoryPrompt); if (n?.trim()) onCategoryOrderChange(n.trim(), categoryOrder.length + 1); }} 
              className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-stone-300 text-stone-400 hover:border-stone-900 transition-all active:scale-90 group"
            >
              <span className="text-lg font-bold group-hover:scale-125 transition-transform">+</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
