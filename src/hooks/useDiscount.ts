import { useState, useCallback, useRef, useEffect } from 'react';
import { TECH, LABELS } from '../data/config';
import { useStore } from '../store/useStore';

import { ActiveDiscount } from '../types';

/**
 * USE DISCOUNT HOOK (LOYALTY & PROMOTION ENGINE)
 * -----------------------------------------------------------
 * Manages customer promotion codes and dynamic discount calculation.
 */
export function useDiscount() {
  const setActiveDiscountStore = useStore((state) => state.setActiveDiscount);
  const [currentlyActiveDiscount, setCurrentlyActiveDiscount] =
    useState<ActiveDiscount | null>(null);
  const [promotionErrorMessage, setPromotionErrorMessage] = useState<
    string | null
  >(null);
  const errorResetTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync with global store for vibe coding efficiency
  useEffect(() => {
    setActiveDiscountStore(currentlyActiveDiscount);
  }, [currentlyActiveDiscount, setActiveDiscountStore]);

  // Lifecycle Cleanup: Ensure timers are cleared on unmount
  useEffect(() => {
    return () => {
      if (errorResetTimer.current) clearTimeout(errorResetTimer.current);
    };
  }, []);

  /**
   * processPromotionCode: Validates input and extracts the discount rate.
   * @param rawInput - The raw string entered by the customer.
   */
  const processPromotionCode = useCallback((rawInput: string) => {
    const sanitizedCode = rawInput.toUpperCase().trim();

    if (errorResetTimer.current) clearTimeout(errorResetTimer.current);

    // Reset workflow if input is cleared
    if (!sanitizedCode) {
      setCurrentlyActiveDiscount(null);
      setPromotionErrorMessage(null);
      return;
    }

    // Logic Token: Extract numerical value from the end of the code (e.g., WELCOME10 -> 10)
    const discountMatch = sanitizedCode.match(/(\d+)$/);

    if (discountMatch && discountMatch[1]) {
      const parsedDiscountRate = parseInt(discountMatch[1], 10);

      // Boundary Validation: Ensure rate is within professional technical limits
      if (
        parsedDiscountRate >= TECH.discount.min &&
        parsedDiscountRate <= TECH.discount.max
      ) {
        setCurrentlyActiveDiscount({
          code: sanitizedCode,
          rate: parsedDiscountRate / 100,
        });
        setPromotionErrorMessage(null);
      } else {
        setCurrentlyActiveDiscount(null);
        setPromotionErrorMessage(LABELS.discount.invalidRate);

        // UX Pattern: Transient error feedback
        errorResetTimer.current = setTimeout(
          () => setPromotionErrorMessage(null),
          TECH.discount.errorResetMs,
        );
      }
    } else {
      // Input Validation: Codes without numerical suffixes are invalid
      setCurrentlyActiveDiscount(null);
      setPromotionErrorMessage(LABELS.discount.invalidCode);

      errorResetTimer.current = setTimeout(
        () => setPromotionErrorMessage(null),
        TECH.discount.errorResetMs,
      );
    }
  }, []);

  return {
    activeDiscount: currentlyActiveDiscount,
    applyCode: processPromotionCode,
    error: promotionErrorMessage,
  };
}
