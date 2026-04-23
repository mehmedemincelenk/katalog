import { memo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../data/config';
import OrderSelector from './OrderSelector';
import { CategoryFilterChipProps } from '../types';

/**
 * CATEGORY FILTER CHIP (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Interactive category selector with admin-only reordering
 * and long-press renaming capabilities.
 */
const CategoryFilterChip = memo(
  ({
    categoryName,
    isItemSelected,
    isAdminMode,
    productCount,
    onSelect,
    onRename,
    onOrderChange,
    currentOrder,
    totalCategories,
  }: CategoryFilterChipProps) => {
    const chipTheme = THEME.searchFilter.categoryList.chip;
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // LONG PRESS LOGIC: Elegant way to trigger rename for admins
    const handlePointerDown = useCallback(() => {
      if (!isAdminMode) return;
      longPressTimer.current = setTimeout(() => {
        const newName = window.prompt('Reyon adını değiştir:', categoryName);
        if (newName && newName.trim() && newName !== categoryName) {
          onRename(categoryName, newName.trim());
        }
      }, 600); // 600ms is the "Diamond Standard" for long press
    }, [isAdminMode, categoryName, onRename]);

    const handlePointerUp = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    return (
      <div
        className={`
        ${chipTheme.container} ${THEME.radius.chip} items-center shrink-0 select-none cursor-pointer transition-all active:scale-95
        ${isItemSelected ? chipTheme.active : chipTheme.inactive}
      `}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} // Safety: Clear if finger slides away
        onClick={() => onSelect(categoryName)}
      >
        <div className="relative h-full shrink-0 overflow-hidden flex items-center">
          <AnimatePresence mode="wait">
            {isAdminMode ? (
              <motion.div
                key="admin-order"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`${chipTheme.counter.base} ${isItemSelected ? chipTheme.counter.active : chipTheme.counter.inactive}`}
              >
                {productCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div
          className={`${chipTheme.textButton} ${isAdminMode ? 'pl-2' : 'pl-4'} pr-4 pointer-events-none`}
        >
          <span
            className={
              isItemSelected ? chipTheme.activeText : chipTheme.inactiveText
            }
          >
            {categoryName}
          </span>
        </div>
      </div>
    );
  },
);

export default CategoryFilterChip;
