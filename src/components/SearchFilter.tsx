import { useState, useMemo, memo, useEffect } from 'react';
import { THEME, LABELS, sortCategories } from '../data/config';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import InfoHint from './InfoHint';
import PlusPlaceholder from './PlusPlaceholder';
import CategoryFilterChip from './CategoryFilterChip';
import { useDebounce } from '../hooks/useCommon';
import { useStore } from '../store/useStore';
import { SearchFilterProps } from '../types';

/**
 * SEARCH FILTER COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Hybrid interaction engine:
 * - Mobile: Expandable reyon list with toggle.
 * - Desktop: Horizontal scroll/wrap with more/less pagination.
 */
const SearchFilter = memo(
  ({
    products = [],
    categoryOrder = [],
    renameCategory,
    onCategoryOrderChange,
    onAddCategory,
  }: SearchFilterProps) => {
    const {
      isAdmin,
      settings,
      searchQuery: search,
      setSearchQuery: onSearchChange,
      activeCategories,
      toggleCategory: onCategoryToggle,
    } = useStore();

    const [internalSearch, setInternalSearch] = useState(search);
    const [isMobileReyonOpen, setIsMobileReyonOpen] = useState(false);
    const [isAllCategoriesVisiblePC, setIsAllCategoriesVisiblePC] =
      useState(false);

    const displayConfig = settings?.displayConfig || {
      showSearch: true,
      showCategories: true,
    };
    const filterTheme = THEME.searchFilter;
    const globalIcons = THEME.icons;

    // Diamond Search Sync: Use debounced value to prevent state thrashing
    const debouncedSearch = useDebounce(internalSearch, 400);

    useEffect(() => {
      onSearchChange(debouncedSearch);
    }, [debouncedSearch, onSearchChange]);

    // Handle external search updates (e.g. from Floating Guest Menu)
    useEffect(() => {
      setInternalSearch(search);
    }, [search]);

    // CATEGORY ANALYTICS: Group and sort for navigation
    const { sortedList, stats } = useMemo(() => {
      const foundInProducts = [
        ...new Set(products.map((p) => p.category).filter(Boolean)),
      ];
      const consolidated = [...new Set([...categoryOrder, ...foundInProducts])];
      const statsObj: Record<string, number> = {};

      products.forEach((p) => {
        if (p.category) statsObj[p.category] = (statsObj[p.category] || 0) + 1;
      });

      return {
        sortedList: sortCategories(consolidated, categoryOrder),
        stats: statsObj,
      };
    }, [products, categoryOrder]);

    const pcVisibleCategories = isAllCategoriesVisiblePC
      ? sortedList
      : sortedList.slice(0, 5);
    const hasMorePC = !isAllCategoriesVisiblePC && sortedList.length > 5;

    const showAll = displayConfig.showSearch || displayConfig.showCategories;
    if (!showAll && !isAdmin) return null;

    // Shared Category List Mapper (Internal Helper)
    const renderCategoryList = (list: string[]) => (
      <>
        <Button
          onClick={() => {
            onCategoryToggle(LABELS.filter.allCategories);
            if (isMobileReyonOpen) setIsMobileReyonOpen(false);
          }}
          variant={activeCategories.length === 0 ? 'primary' : 'secondary'}
          mode="rectangle"
          className="px-5 py-2.5 sm:px-[19px] sm:py-[10px] text-[10px] font-black uppercase tracking-widest shrink-0 !rounded-xl"
        >
          {LABELS.filter.allCategories}
        </Button>
        {list.map((cat) => (
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
        {isAdmin && (
          <PlusPlaceholder
            type="CATEGORY"
            onClick={() => {
              const name = window.prompt(LABELS.filter.newCategoryPrompt);
              if (name?.trim()) onAddCategory?.(name.trim());
            }}
          />
        )}
      </>
    );

    return (
      <div
        className={`w-full bg-white border-b border-stone-100 py-3 relative z-40 ${!showAll ? 'opacity-50 grayscale' : ''}`}
      >
        <div className={filterTheme.container}>
          {/* SEARCH & MOBILE CONTROL BAR */}
          {displayConfig.showSearch ? (
            <div className={`${filterTheme.searchArea.wrapper} items-stretch`}>
              <div
                className={`${filterTheme.searchArea.inputWrapper} ${THEME.radius.input} sm:hidden !flex-1 h-11`}
              >
                <div className={filterTheme.searchArea.iconSize}>
                  {globalIcons.search}
                </div>
                <input
                  type="text"
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  placeholder={LABELS.filter.searchPlaceholder}
                  className={`${filterTheme.searchArea.input} ${THEME.radius.input} h-full`}
                />
                <InfoHint
                  message="Akıllı aramamızla hem ürün adlarını hem de reyonları saniyeler içinde bulabilirsiniz."
                  className="mr-3"
                />
              </div>

              {displayConfig.showCategories && (
                <Button
                  onClick={() => setIsMobileReyonOpen(!isMobileReyonOpen)}
                  variant="primary"
                  mode="rectangle"
                  className={`sm:hidden h-11 px-6 min-w-[120px] font-black !bg-stone-900 !text-white !rounded-xl`}
                >
                  {LABELS.filter.categoryBtn}
                </Button>
              )}
            </div>
          ) : (
            displayConfig.showCategories && (
              <div className="sm:hidden flex justify-end">
                <Button
                  onClick={() => setIsMobileReyonOpen(!isMobileReyonOpen)}
                  variant="primary"
                  mode="rectangle"
                  className="h-11 px-8 !bg-stone-900 !text-white font-black !rounded-xl"
                >
                  {LABELS.filter.categoryBtn}
                </Button>
              </div>
            )
          )}

          {/* MOBILE CATEGORY PANEL */}
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
                    {renderCategoryList(sortedList)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* DESKTOP CATEGORY BAR */}
          {displayConfig.showCategories && (
            <div className="hidden sm:flex mt-3 items-center w-full">
              <div
                className={`flex gap-2 py-1 px-1 -mx-1 flex-1 no-scrollbar ${isAllCategoriesVisiblePC ? 'flex-wrap items-start' : 'items-center overflow-x-auto'}`}
              >
                {renderCategoryList(pcVisibleCategories)}

                {hasMorePC && (
                  <Button
                    onClick={() => setIsAllCategoriesVisiblePC(true)}
                    variant="secondary"
                    mode="rectangle"
                    className="shrink-0 px-6 py-2.5 border-2 border-dashed border-stone-200 text-stone-400 font-black text-[10px] uppercase tracking-widest !rounded-full hover:border-stone-900 hover:text-stone-900 shadow-none"
                  >
                    + DAHA FAZLA
                  </Button>
                )}
                {isAllCategoriesVisiblePC && sortedList.length > 6 && (
                  <Button
                    onClick={() => setIsAllCategoriesVisiblePC(false)}
                    variant="secondary"
                    mode="rectangle"
                    className="shrink-0 px-6 py-2.5 border-2 border-dashed border-stone-200 text-stone-400 font-black text-[10px] uppercase tracking-widest !rounded-full hover:border-stone-900 hover:text-stone-900 shadow-none"
                  >
                    - DAHA AZ
                  </Button>
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
  },
);

export default SearchFilter;
