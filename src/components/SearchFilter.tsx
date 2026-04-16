import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import { THEME, LABELS, TECH, sortCategories } from '../data/config';
import { Product } from '../types';

/**
 * SEARCH FILTER COMPONENT (Minimalist Pagination Version)
 * -----------------------------------------------------------
 * Simple, efficient, and professional. One row, manual scroll, "Show More" logic.
 */

interface SearchFilterProps {
  products: Product[];
  categoryOrder: string[];
  onCategoryOrderChange: (categoryName: string, newPosition: number) => void;
  search: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  activeCategories?: string[];
  onCategoryToggle: (categoryName: string) => void;
  isAdmin: boolean;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategoryFromProducts: (categoryName: string) => void;
}

interface CategoryFilterChipProps {
  categoryName: string;
  isItemSelected: boolean;
  isAdminMode: boolean;
  productCount: number;
  onSelect: (categoryName: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onOrderChange: (categoryName: string, newPosition: number) => void;
  currentOrder: number;
  totalCategories: number;
}

const CategoryFilterChip = memo(({ 
  categoryName, 
  isItemSelected, 
  isAdminMode, 
  productCount, 
  onSelect, 
  onRename, 
  onOrderChange, 
  currentOrder, 
  totalCategories
}: CategoryFilterChipProps) => {
  const chipTheme = THEME.searchFilter.categoryList.chip;
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = useCallback(() => {
    if (!isAdminMode) return;
    longPressTimer.current = setTimeout(() => {
      const newName = window.prompt("Reyon adını değiştir:", categoryName);
      if (newName && newName.trim() && newName !== categoryName) {
        onRename(categoryName, newName.trim());
      }
    }, 600);
  }, [isAdminMode, categoryName, onRename]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  return (
    <div 
      className={`
        ${chipTheme.container} ${THEME.radius.chip} items-center shrink-0 select-none cursor-pointer transition-all active:scale-95
        ${isItemSelected ? chipTheme.active : chipTheme.inactive}
      `}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={() => onSelect(categoryName)}
    >
      <div className="relative h-full shrink-0 overflow-hidden flex items-center">
        {isAdminMode ? (
          <div className="relative group px-1">
            <span className={`${chipTheme.counter.base} ${chipTheme.counter.inactive} !w-7 !h-7 sm:!w-8 sm:!h-8 flex items-center justify-center text-[10px] font-black border-r border-stone-100`}>
              {currentOrder}.
            </span>
            <select 
              value={currentOrder}
              onChange={(e) => onOrderChange?.(categoryName, parseInt(e.target.value, 10))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {Array.from({ length: totalCategories }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        ) : (
          <span className={`${chipTheme.counter.base} ${isItemSelected ? chipTheme.counter.active : chipTheme.counter.inactive}`}>
            {productCount}
          </span>
        )}
      </div>
      <div className={`${chipTheme.textButton} ${isAdminMode ? 'pl-2' : 'pl-4'} pr-4 pointer-events-none`}>
        <span className={isItemSelected ? chipTheme.activeText : chipTheme.inactiveText}>{categoryName}</span>
      </div>
    </div>
  );
});

export default function SearchFilter({ 
  products = [], 
  categoryOrder = [], 
  search, 
  onSearchChange, 
  activeCategories = [], 
  onCategoryToggle, 
  isAdmin, 
  renameCategory, 
  onCategoryOrderChange
}: SearchFilterProps) {

  const [internalSearch, setInternalSearch] = useState(search);
  const [visibleLimit, setVisibleLimit] = useState(6);
  const [isMobile, setIsMobile] = useState(false);
  
  const filterTheme = THEME.searchFilter;
  const globalIcons = THEME.icons;

  // Screen size detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(internalSearch), TECH.searchDebounceMs);
    return () => clearTimeout(timer);
  }, [internalSearch, onSearchChange]);

  const { sortedList, stats } = useMemo(() => {
    const foundInProducts = [...new Set(products.map(p => p.category).filter(Boolean))];
    const consolidated = [...new Set([...categoryOrder, ...foundInProducts])];
    const statsObj: Record<string, number> = {};
    products.forEach(p => { if (p.category) statsObj[p.category] = (statsObj[p.category] || 0) + 1; });
    return { sortedList: sortCategories(consolidated, categoryOrder), stats: statsObj };
  }, [products, categoryOrder]);

  // Logic: Show all on mobile, paginated on desktop
  const visibleCategories = isMobile ? sortedList : sortedList.slice(0, visibleLimit);
  const hasMore = !isMobile && sortedList.length > visibleLimit;

  return (
    <div className="w-full bg-white border-b border-stone-100 py-3 relative z-40">
      <div className={filterTheme.container}>
        <div className={filterTheme.searchArea.wrapper}>
          <div className={`${filterTheme.searchArea.inputWrapper} ${THEME.radius.input}`}>
            <div className={filterTheme.searchArea.iconSize}>{globalIcons.search}</div>
            <input 
              type="text" value={internalSearch} 
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder={LABELS.filter.searchPlaceholder}
              className={`${filterTheme.searchArea.input} ${THEME.radius.input}`}
            />
          </div>
        </div>

        <div className="relative mt-3 sm:mt-0 sm:ml-4 flex-1 min-w-0 flex items-center">
          <div className={`
            flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 -mx-1 flex-1
            ${isMobile ? 'flex-nowrap' : ''}
          `}>
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
            
            <button 
              onClick={() => onCategoryToggle(LABELS.filter.allCategories)}
              className={`
                ${filterTheme.categoryList.chip.container} ${THEME.radius.chip} px-5 py-2.5 ${THEME.font.xs} font-black uppercase tracking-widest shrink-0 transition-all active:scale-95
                ${activeCategories.length === 0 ? filterTheme.categoryList.chip.active : filterTheme.categoryList.chip.inactive}
              `}
            >
              {LABELS.filter.allCategories}
            </button>

            {visibleCategories.map((cat) => (
              <CategoryFilterChip 
                key={cat} 
                categoryName={cat} 
                isItemSelected={activeCategories.includes(cat)} 
                isAdminMode={isAdmin} 
                productCount={stats[cat] || 0}
                onSelect={onCategoryToggle}
                onRename={renameCategory}
                onOrderChange={onCategoryOrderChange}
                currentOrder={sortedList.indexOf(cat) + 1}
                totalCategories={sortedList.length}
              />
            ))}

            {/* SHOW MORE BUTTON (Sadece PC'de aktif) */}
            {hasMore && (
              <button 
                onClick={() => setVisibleLimit(prev => prev + 4)}
                className={`
                  shrink-0 px-6 py-2.5 border-2 border-dashed border-stone-200 text-stone-400 font-black text-[10px] uppercase tracking-widest rounded-full 
                  hover:border-stone-900 hover:text-stone-900 transition-all active:scale-95
                `}
              >
                + DAHA FAZLA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
