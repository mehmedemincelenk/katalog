import { useState, useCallback } from 'react';
import { LABELS } from '../data/config';

/**
 * USE LOCAL STORAGE HOOK (PERSISTENCE & DATA MANAGEMENT)
 * -----------------------------------------------------------
 * Ensures seamless data retention across browser sessions.
 */
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
