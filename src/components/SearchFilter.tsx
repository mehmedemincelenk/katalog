import React, { useState } from 'react';
import { sortCategories } from '../data/config';
import { Product } from '../types';
import { ActiveDiscount } from '../hooks/useDiscount';

interface SearchFilterProps {
  products: Product[];
  categoryOrder: string[];
  updateCategoryOrder: (newOrder: string[]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  activeCategories?: string[];
  onCategoryToggle: (category: string) => void;
  isAdmin: boolean;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategoryFromProducts: (category: string) => void;
  // İndirim Sistemi
  activeDiscount?: ActiveDiscount | null;
  onApplyDiscount?: (code: string) => void;
  discountError?: string | null;
}

export default function SearchFilter({
  products,
  categoryOrder,
  updateCategoryOrder,
  search,
  onSearchChange,
  activeCategories = [],
  onCategoryToggle,
  isAdmin,
  renameCategory,
  removeCategoryFromProducts,
}: SearchFilterProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const dynamicCategories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const sortedList = sortCategories(dynamicCategories, categoryOrder);
  const categories = ['Tümü', ...sortedList];

  const DESKTOP_THRESHOLD = 8;
  const hasMore = categories.length > DESKTOP_THRESHOLD;
  
  const visibleCategories = (showAll || isAdmin || isMenuOpen) 
    ? categories 
    : categories.slice(0, DESKTOP_THRESHOLD);

  const handleCategoryOrderChange = (catName: string, newPosition: number) => {
    const newOrder = [...categoryOrder];
    const currentIdx = newOrder.indexOf(catName);
    if (currentIdx !== -1) {
      newOrder.splice(currentIdx, 1);
      // newPosition 1-tabanlı olduğu için -1 yapıyoruz
      newOrder.splice(newPosition - 1, 0, catName);
      updateCategoryOrder(newOrder);
    }
  };

  return (
    <section className="bg-white border-b border-stone-200 py-3 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        
        {/* Search Row */}
        <div className={`flex w-full sm:w-auto items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap ${isAdmin ? 'sm:hidden' : ''}`}>
          <div className="relative flex-1 sm:w-48 min-w-[140px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ürün ara…"
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-kraft-400"
            />
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-100 border border-stone-300 rounded-md text-[10px] font-bold text-stone-700"
          >
            <span>{isMenuOpen ? '✕' : '📂'}</span> Kategoriler
          </button>
        </div>

        {/* Categories Section */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 items-center flex-1 transition-all w-full`}>
          {visibleCategories.map((cat) => {
            const isSelected = cat === 'Tümü' ? activeCategories.length === 0 : activeCategories.includes(cat);
            const isActualCategory = cat !== 'Tümü';

            return (
              <div key={cat} className="flex items-center">
                <div 
                  className={`flex items-center rounded-full border transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-105'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
                  }`}
                >
                  {/* Entegre Sıra Dropdown (Admin) */}
                  {isAdmin && isActualCategory && (
                    <div className="flex items-center shrink-0">
                      <select
                        value={sortedList.indexOf(cat) + 1}
                        onChange={(e) => handleCategoryOrderChange(cat, parseInt(e.target.value, 10))}
                        style={{ textAlignLast: 'center', padding: 0 }}
                        className="bg-stone-100 text-stone-900 text-[12px] font-black w-9 h-8 p-0 cursor-pointer focus:outline-none appearance-none rounded-l-full active:bg-stone-200 transition-colors text-center"
                      >
                        {sortedList.map((_, i) => (
                          <option key={i + 1} value={i + 1} className="text-black">{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => onCategoryToggle(cat)}
                    className={`py-1.5 text-[10px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 ${isAdmin && isActualCategory ? 'pr-3 pl-1.5' : 'px-3'}`}
                  >
                    <span
                      contentEditable={isAdmin && isActualCategory}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        if (!isAdmin || !isActualCategory) return;
                        const newName = e.currentTarget.textContent?.trim() || '';
                        if (newName && newName !== cat) renameCategory(cat, newName);
                        else e.currentTarget.textContent = cat;
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
                      onClick={(e) => isAdmin && isActualCategory && e.stopPropagation()}
                      className={isAdmin && isActualCategory ? 'cursor-text focus:bg-white/20 px-0.5 rounded' : ''}
                    >
                      {cat}
                    </span>
                    
                    {isAdmin && isActualCategory && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); if(window.confirm(`${cat} silinsin mi?`)) removeCategoryFromProducts(cat); }}
                        className="ml-1 text-red-400 hover:text-red-600 font-bold text-xs"
                      >
                        ×
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
          
          {hasMore && !isAdmin && !isMenuOpen && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200 transition-colors"
            >
              {showAll ? ' Daha Az' : `+${categories.length - DESKTOP_THRESHOLD} Daha`}
            </button>
          )}

          {/* Yeni Kategori Ekle Butonu (Sadece Admin) */}
          {isAdmin && (
            <button
              onClick={() => {
                const name = window.prompt('Yeni kategori adını yazın:');
                if (name?.trim() && !categoryOrder.includes(name.trim())) {
                  updateCategoryOrder([...categoryOrder, name.trim()]);
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-stone-300 text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-all active:scale-90"
              title="Yeni Kategori Ekle"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
