import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import { THEME, LABELS, TECH, sortCategories } from '../data/config';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SEARCH FILTER COMPONENT (Pure Minimalist Version - Production Ready)
 * -----------------------------------------------------------
 * Optimized for performance and stability. Zero unrelated changes.
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
  addCategory: (newName: string) => void;
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
  const isLongPressActive = useRef(false);

  const handlePointerDown = useCallback(() => {
    if (!isAdminMode) return;
    isLongPressActive.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true;
      const newName = window.prompt("Reyon adını değiştir:", categoryName);
      if (newName && newName.trim() && newName !== categoryName) {
        onRename(categoryName, newName.trim());
      }
    }, 600);
  }, [isAdminMode, categoryName, onRename]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (isLongPressActive.current) {
      isLongPressActive.current = false;
      return;
    }
    onSelect(categoryName);
  }, [categoryName, onSelect]);

  return (
    <motion.div 
      layout
      className={`
        ${chipTheme.container} ${THEME.radius.chip} items-center shrink-0 select-none cursor-pointer
        ${isItemSelected ? chipTheme.active : chipTheme.inactive}
      `}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
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
    </motion.div>
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
  removeCategoryFromProducts, 
  onCategoryOrderChange
}: SearchFilterProps) {

  const [isReyonOpen, setIsReyonOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState(search);
  
  const filterTheme = THEME.searchFilter;
  const globalIcons = THEME.icons;

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

  const handleAllCategories = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoryToggle(LABELS.filter.allCategories);
  }, [onCategoryToggle]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // SCROLL SYNC & ARROW VISIBILITY
  const updateArrows = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, sortedList]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeItem = scrollContainerRef.current.querySelector('.active-category');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // MOUSE DRAG SCROLLING
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

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
          <button onClick={() => setIsReyonOpen(!isReyonOpen)} className={`${filterTheme.searchArea.mobileToggle} ${THEME.radius.button} sm:hidden`}>
            {LABELS.filter.categoryBtn}
          </button>
        </div>

        <div className="relative mt-3 sm:mt-0 sm:ml-4 flex-1 min-w-0 group/scroll">
          {/* LEFT ARROW */}
          {showLeftArrow && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur shadow-lg border border-stone-100 rounded-full text-stone-900 hidden sm:flex transition-opacity hover:bg-white"
            >
              <span className="w-4 h-4">{globalIcons.chevronLeft}</span>
            </button>
          )}

          <div 
            ref={scrollContainerRef}
            onScroll={updateArrows}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`
              flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 -mx-1
              ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            `}
            style={{ 
              msOverflowStyle: 'none', 
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              .no-scrollbar::-webkit-scrollbar { display: none; }
            `}} />
            
            <button 
              onClick={handleAllCategories}
              className={`
                ${filterTheme.categoryList.chip.container} ${THEME.radius.chip} px-5 py-2.5 ${THEME.font.xs} font-black uppercase tracking-widest shrink-0 transition-all active:scale-95
                ${activeCategories.length === 0 ? filterTheme.categoryList.chip.active + ' active-category' : filterTheme.categoryList.chip.inactive}
              `}
            >
              {LABELS.filter.allCategories}
            </button>

            {sortedList.map((cat) => (
              <div key={cat} className={activeCategories.includes(cat) ? 'active-category' : ''}>
                <CategoryFilterChip 
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
              </div>
            ))}
          </div>

          {/* RIGHT ARROW */}
          {showRightArrow && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur shadow-lg border border-stone-100 rounded-full text-stone-900 hidden sm:flex transition-opacity hover:bg-white"
            >
              <span className="w-4 h-4">{globalIcons.chevronRight}</span>
            </button>
          )}
          
          {/* GRADIENT OVERLAYS */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/40 to-transparent pointer-events-none z-10 hidden sm:block"></div>
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/40 to-transparent pointer-events-none z-10 hidden sm:block"></div>
        </div>
      </div>
    </div>
  );
}
