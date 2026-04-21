// FILE ROLE: Interactive Catalog Filtering and Navigation Engine
// DEPENDS ON: THEME, motion, OrderSelector logic
// CONSUMED BY: App.tsx
import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import { THEME, LABELS, TECH, sortCategories } from '../data/config';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import OrderSelector from './OrderSelector';
import InfoHint from './InfoHint';

/**
 * SEARCH FILTER COMPONENT (Smart Hybrid Version)
 * -----------------------------------------------------------
 * Mobile: Toggle button + Full list (Original Flow)
 * Desktop: Single row + Pagination (+ More Button)
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
  displayConfig?: {
    showSearch: boolean;
    showCategories: boolean;
  };
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
        <AnimatePresence mode="wait">
          {isAdminMode ? (
            <motion.div 
              key="admin-order"
              initial={false}
              animate={{ opacity: 1, transform: 'translateZ(0)' }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
              className="relative group px-1 h-8 flex items-center border-r border-stone-100"
            >
              <OrderSelector 
                currentOrder={currentOrder}
                totalCount={totalCategories}
                onChange={(newPos) => onOrderChange(categoryName, newPos)}
                className="!shadow-none !bg-transparent !border-none !h-7 !w-7"
              />
            </motion.div>
          ) : (
            <motion.span 
              key="guest-count"
              initial={false}
              animate={{ opacity: 1, transform: 'translateZ(0)' }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
              className={`${chipTheme.counter.base} ${isItemSelected ? chipTheme.counter.active : chipTheme.counter.inactive}`}
            >
              {productCount}
            </motion.span>
          )}
        </AnimatePresence>
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
  onCategoryOrderChange,
  displayConfig = { showSearch: true, showCategories: true }
}: SearchFilterProps) {

  const [internalSearch, setInternalSearch] = useState(search);
  const [isMobileReyonOpen, setIsMobileReyonOpen] = useState(false);
  const [isAllCategoriesVisiblePC, setIsAllCategoriesVisiblePC] = useState(false);
  
  const filterTheme = THEME.searchFilter;
  const globalIcons = THEME.icons;

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(internalSearch), TECH.searchDebounceMs);
    return () => clearTimeout(timer);
  }, [internalSearch, onSearchChange]);

  useEffect(() => {
    setInternalSearch(search);
  }, [search]);

  const { sortedList, stats } = useMemo(() => {
    const foundInProducts = [...new Set(products.map(p => p.category).filter(Boolean))];
    const consolidated = [...new Set([...categoryOrder, ...foundInProducts])];
    const statsObj: Record<string, number> = {};
    products.forEach(p => { if (p.category) statsObj[p.category] = (statsObj[p.category] || 0) + 1; });
    return { sortedList: sortCategories(consolidated, categoryOrder), stats: statsObj };
  }, [products, categoryOrder]);

  const pcVisibleCategories = isAllCategoriesVisiblePC ? sortedList : sortedList.slice(0, 6);
  const hasMorePC = !isAllCategoriesVisiblePC && sortedList.length > 6;

  const showAll = displayConfig.showSearch || displayConfig.showCategories;
  if (!showAll && !isAdmin) return null;

  return (
    <div className={`w-full bg-white border-b border-stone-100 py-3 relative z-40 ${!showAll ? 'opacity-50 grayscale' : ''}`}>
      <div className={filterTheme.container}>
        {/* TOP BAR: Search + Mobile Toggle */}
        {displayConfig.showSearch ? (
          <div className={`${filterTheme.searchArea.wrapper} items-stretch`}>
            <div className={`${filterTheme.searchArea.inputWrapper} ${THEME.radius.input} sm:hidden !flex-1 h-11`}>
              <div className={filterTheme.searchArea.iconSize}>{globalIcons.search}</div>
              <input 
                type="text" value={internalSearch} 
                onChange={(e) => setInternalSearch(e.target.value)}
                placeholder={LABELS.filter.searchPlaceholder}
                className={`${filterTheme.searchArea.input} ${THEME.radius.input} h-full`}
              />
              <InfoHint 
                message="Akıllı aramamızla hem ürün adlarını hem de reyonları saniyeler içinde bulabilirsiniz." 
                className="mr-3"
              />
            </div>
            
            {/* MOBILE ONLY: Categories Toggle Button - Standardized Height and Width */}
            {displayConfig.showCategories && (
              <button 
                onClick={() => setIsMobileReyonOpen(!isMobileReyonOpen)} 
                className={`${filterTheme.searchArea.mobileToggle} ${THEME.radius.button} sm:hidden flex items-center justify-center gap-2 h-11 px-6 min-w-[120px] font-black !bg-stone-900 !text-white`}
              >
                {LABELS.filter.categoryBtn}
              </button>
            )}
          </div>
        ) : (
          /* Search is OFF, but category might be ON (Mobile Toggle needed) */
          displayConfig.showCategories && (
            <div className="sm:hidden flex justify-end">
              <button 
                onClick={() => setIsMobileReyonOpen(!isMobileReyonOpen)} 
                className={`${filterTheme.searchArea.mobileToggle} ${THEME.radius.button} flex items-center justify-center gap-2 h-11 px-8 !bg-stone-900 !text-white font-black`}
              >
                {LABELS.filter.categoryBtn}
              </button>
            </div>
          )
        )}

        {/* MOBILE VIEW: Expandable List */}
        {displayConfig.showCategories && (
          <AnimatePresence>
            {isMobileReyonOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="sm:hidden overflow-hidden mt-3"
              >
                <div className="flex flex-wrap gap-2 py-1">
                  <button 
                    onClick={() => { onCategoryToggle(LABELS.filter.allCategories); setIsMobileReyonOpen(false); }}
                    className={`
                      ${filterTheme.categoryList.chip.container} ${THEME.radius.chip} px-5 py-2.5 sm:px-[19px] sm:py-[10px] ${THEME.font.xs} sm:text-[10px] font-black uppercase tracking-widest transition-all
                      ${activeCategories.length === 0 ? filterTheme.categoryList.chip.active : filterTheme.categoryList.chip.inactive}
                    `}
                  >
                    {LABELS.filter.allCategories}
                  </button>
                  {sortedList.map((cat) => (
                    <CategoryFilterChip 
                      key={cat} 
                      categoryName={cat} 
                      isItemSelected={activeCategories.includes(cat)} 
                      isAdminMode={isAdmin} 
                      productCount={stats[cat] || 0}
                      onSelect={(c) => { onCategoryToggle(c); /* Optionally auto-close */ }}
                      onRename={renameCategory}
                      onOrderChange={onCategoryOrderChange}
                      currentOrder={sortedList.indexOf(cat) + 1}
                      totalCategories={sortedList.length}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* DESKTOP VIEW: Single Row + Pagination */}
        {displayConfig.showCategories && (
          <div className="hidden sm:flex mt-3 items-center w-full">
            <div className={`flex gap-2 py-1 px-1 -mx-1 flex-1 ${isAllCategoriesVisiblePC ? 'flex-wrap items-start' : 'items-center overflow-x-auto no-scrollbar'}`}>
              <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
              
              <button 
                onClick={() => onCategoryToggle(LABELS.filter.allCategories)}
                className={`
                  ${filterTheme.categoryList.chip.container} ${THEME.radius.chip} px-5 py-2.5 sm:px-[19px] sm:py-[10px] ${THEME.font.xs} sm:text-[10px] font-black uppercase tracking-widest shrink-0 transition-all active:scale-95
                  ${activeCategories.length === 0 ? filterTheme.categoryList.chip.active : filterTheme.categoryList.chip.inactive}
                `}
              >
                {LABELS.filter.allCategories}
              </button>

              {pcVisibleCategories.map((cat) => (
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

              {hasMorePC && (
                <button 
                  onClick={() => setIsAllCategoriesVisiblePC(true)}
                  className={`
                    shrink-0 px-6 py-2.5 border-2 border-dashed border-stone-200 text-stone-400 font-black text-[10px] uppercase tracking-widest rounded-full 
                    hover:border-stone-900 hover:text-stone-900 transition-all active:scale-95
                  `}
                >
                  + DAHA FAZLA
                </button>
              )}
              {isAllCategoriesVisiblePC && sortedList.length > 6 && (
                <button 
                  onClick={() => setIsAllCategoriesVisiblePC(false)}
                  className={`
                    shrink-0 px-6 py-2.5 border-2 border-dashed border-stone-200 text-stone-400 font-black text-[10px] uppercase tracking-widest rounded-full 
                    hover:border-stone-900 hover:text-stone-900 transition-all active:scale-95
                  `}
                >
                  - DAHA AZ
                </button>
              )}
            </div>
          </div>
        )}

        {!showAll && isAdmin && (
          <div className="text-[10px] font-black uppercase text-stone-400 text-center py-2 italic">
            Bu alan gizli (Sadece Admin Görür)
          </div>
        )}
      </div>
    </div>
  );
}
