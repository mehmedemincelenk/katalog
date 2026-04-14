import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import { THEME, LABELS, TECH, sortCategories } from '../data/config';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SEARCH FILTER COMPONENT (Indestructible Precision Version)
 * -----------------------------------------------------------
 * - Click-based outside detection (no more mousedown issues).
 * - High-tolerance scroll detection.
 */

interface SearchFilterProps {
  products: Product[];
  categoryOrder: string[];
  onCategoryOrderChange: (categoryName: string, newPosition: number) => void;
  search: string;
  onSearchChange: (newValue: string) => void;
  activeCategories?: string[];
  onCategoryToggle: (categoryName: string) => void;
  isAdmin: boolean;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategoryFromProducts: (categoryName: string) => void;
}

const CategoryFilterChip = memo(({ 
  categoryName, isItemSelected, isAdminMode, productCount, onSelect, onDelete, onRename, onOrderChange, currentOrder, totalCategories
}: any) => {
  const chipTheme = THEME.searchFilter.categoryList.chip;

  return (
    <div className={`${chipTheme.container} ${THEME.radius.chip} items-center shrink-0 ${isItemSelected ? chipTheme.active : chipTheme.inactive}`}>
      {!isAdminMode && (
        <span className={`${chipTheme.counter.base} ${isItemSelected ? chipTheme.counter.active : chipTheme.counter.inactive}`}>
          {productCount}
        </span>
      )}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(); }}
        className={`${chipTheme.textButton} pl-2 pr-4`}
      >
        <span className={isItemSelected ? chipTheme.activeText : chipTheme.inactiveText}>{categoryName}</span>
      </button>
    </div>
  );
});

export default function SearchFilter({ 
  products = [], categoryOrder = [], onCategoryOrderChange, search, onSearchChange, activeCategories = [], onCategoryToggle, isAdmin, renameCategory, removeCategoryFromProducts
}: SearchFilterProps) {
  const [isBarOpen, setIsBarOpen] = useState(false);
  const [isReyonOpen, setIsReyonOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [internalSearch, setInternalSearch] = useState(search);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollPos = useRef(0);
  const timeOfLastAction = useRef(0);
  
  const filterTheme = THEME.searchFilter;
  const globalIcons = THEME.icons;

  // 1. SCROLL MONITOR: intentional closing logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 250);

      // Only close if it's been at least 500ms since opening (prevents layout shift closure)
      if ((isBarOpen || isReyonOpen) && Date.now() - timeOfLastAction.current > 500) {
        if (Math.abs(currentScroll - lastScrollPos.current) > 150) {
          setIsBarOpen(false);
          setIsReyonOpen(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBarOpen, isReyonOpen]);

  // 2. CLICK OUTSIDE: Using 'click' for better stability with touch devices
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((isBarOpen || isReyonOpen) && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsBarOpen(false);
        setIsReyonOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isBarOpen, isReyonOpen]);

  const openBar = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    lastScrollPos.current = window.scrollY;
    timeOfLastAction.current = Date.now();
    setIsBarOpen(true);
  }, []);

  const toggleReyons = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    timeOfLastAction.current = Date.now();
    setIsReyonOpen(prev => !prev);
  }, []);

  // 3. DATA & SEARCH
  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(internalSearch), TECH.searchDebounceMs);
    return () => clearTimeout(timer);
  }, [internalSearch, onSearchChange]);

  const { sortedList, stats } = useMemo(() => {
    const found = [...new Set(products.map(p => p.category).filter(Boolean))];
    const consolidated = [...new Set([...categoryOrder, ...found])];
    const statsObj: Record<string, number> = {};
    products.forEach(p => { if (p.category) statsObj[p.category] = (statsObj[p.category] || 0) + 1; });
    return { sortedList: sortCategories(consolidated, categoryOrder), stats: statsObj };
  }, [products, categoryOrder]);

  return (
    <>
      <AnimatePresence>
        {isScrolled && !isBarOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={openBar}
            className="fixed top-16 left-4 z-[110] w-12 h-12 bg-white shadow-2xl border flex items-center justify-center text-stone-900 rounded-full active:scale-90"
          >
            <div className="w-5 h-5">{globalIcons.search}</div>
          </motion.button>
        )}
      </AnimatePresence>

      <div 
        ref={containerRef}
        className={`
          ${filterTheme.layout} 
          ${isScrolled ? 'fixed top-[56px] sm:top-[64px] left-0 right-0 shadow-xl' : 'relative sticky top-[56px] sm:top-[64px]'}
          ${isScrolled && !isBarOpen ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'} 
          transition-all duration-300 w-full z-[105]
        `}
      >
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
            <button onClick={toggleReyons} className={`${filterTheme.searchArea.mobileToggle} ${THEME.radius.button}`}>
              {LABELS.filter.categoryBtn}
            </button>
          </div>

          <div className={`${filterTheme.categoryList.wrapper} ${isReyonOpen ? 'flex' : 'hidden sm:flex'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); onCategoryToggle(LABELS.filter.allCategories); }}
              className={`${filterTheme.categoryList.chip.container} ${THEME.radius.chip} px-5 py-2 ${THEME.font.xs} font-black uppercase tracking-widest ${activeCategories.length === 0 ? filterTheme.categoryList.chip.active : filterTheme.categoryList.chip.inactive}`}
            >
              {LABELS.filter.allCategories}
            </button>

            {sortedList.map((cat) => (
              <CategoryFilterChip 
                key={cat} categoryName={cat} isItemSelected={activeCategories.includes(cat)} isAdminMode={isAdmin} productCount={stats[cat] || 0}
                onSelect={() => onCategoryToggle(cat)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
