import { useState, useEffect, useCallback } from 'react';
import { LABELS } from '../data/config';

/**
 * COMMON UTILITY HOOKS (DIAMOND STANDARD)
 * -----------------------------------------------------------
 * Generic tools for state persistence, debouncing, and general logic.
 */

/**
 * useDebounce: Delays updating a value until a specific time has passed.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * useLocalStorage: Ensures seamless data retention across browser sessions.
 */
export function useLocalStorage<T>(storageKey: string, initialValue: T): [T, (updateValue: T | ((val: T) => T)) => void] {
  const [persistedData, setPersistedData] = useState<T>(() => {
    try {
      const serializedItem = window.localStorage.getItem(storageKey);
      return serializedItem ? JSON.parse(serializedItem) : initialValue;
    } catch (readError) {
      console.warn(LABELS.storage.readError(storageKey), readError);
      return initialValue;
    }
  });

  const updatePersistedData = useCallback(
    (updateValue: T | ((val: T) => T)) => {
      setPersistedData((previousData) => {
        const finalizedData = updateValue instanceof Function ? updateValue(previousData) : updateValue;
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(finalizedData));
        } catch (writeError) {
          if (
            writeError instanceof DOMException &&
            (writeError.name === 'QuotaExceededError' || writeError.name === 'NS_ERROR_DOM_QUOTA_REACHED')
          ) {
            console.error(LABELS.storage.quotaExceeded);
            alert(LABELS.storage.quotaAlert);
          }
        }
        return finalizedData;
      });
    },
    [storageKey]
  );

  return [persistedData, updatePersistedData];
}
