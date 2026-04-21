// FILE: src/hooks/useLocalStorage.ts
// ROLE: Generic hook for state management synchronized with localStorage
// READS FROM: src/data/config
// USED BY: Utility hook potentially used across settings or basic persistence layers

import { useState, useCallback } from 'react';
import { LABELS } from '../data/config';

/**
 * USE LOCAL STORAGE HOOK (PERSISTENCE & DATA MANAGEMENT)
 * -----------------------------------------------------------
 * Ensures seamless data retention across browser sessions.
 */

// ARCHITECTURE: useLocalStorage
// PURPOSE: A robust wrapper around useState and localStorage that safely handles parsing and quota exceptions
// DEPENDENCIES: window.localStorage
// CONSUMERS: General application components needing persistent state
export function useLocalStorage<T>(storageKey: string, initialValue: T): [T, (updateValue: T | ((val: T) => T)) => void] {
  
  // Initialization: Retrieve existing data from persistent storage
  const [persistedData, setPersistedData] = useState<T>(() => {
    try {
      const serializedItem = window.localStorage.getItem(storageKey);
      // Logic Pattern: Parse existing data or fallback to specified default
      return serializedItem ? JSON.parse(serializedItem) : initialValue;
    } catch (readError) {
      // Professional Feedback: Notify developer of read failures
      console.warn(LABELS.storage.readError(storageKey), readError);
      return initialValue;
    }
  });

  /**
   * updatePersistedData: Synchronizes local state with physical browser storage.
   * @param updateValue - The new data or a transformation function.
   */
  const updatePersistedData = useCallback((updateValue: T | ((val: T) => T)) => {
    setPersistedData(previousData => {
      // Standard Pattern: Calculate next state based on current value
      const finalizedData = updateValue instanceof Function ? updateValue(previousData) : updateValue;
      
      try {
        // Physical Write: Persist data to device storage
        window.localStorage.setItem(storageKey, JSON.stringify(finalizedData));
      } catch (writeError) {
        // Critical Error Handling: Detect and notify when device storage is full (QuotaExceeded)
        if (writeError instanceof DOMException && (writeError.name === 'QuotaExceededError' || writeError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          console.error(LABELS.storage.quotaExceeded);
          alert(LABELS.storage.quotaAlert);
        }
      }
      return finalizedData;
    });
  }, [storageKey]);

  return [persistedData, updatePersistedData];
}
