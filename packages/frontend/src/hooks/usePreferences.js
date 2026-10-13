import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PREFERENCES } from '../constants';

const STORAGE_KEY = 'todo-app.preferences';

function readStoredPreferences() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return {
      ...DEFAULT_PREFERENCES,
      ...stored,
      filters: { ...DEFAULT_PREFERENCES.filters, ...stored?.filters },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState(readStoredPreferences);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage can be unavailable (private mode, quota); preferences then last for the session only.
    }
  }, [preferences]);

  const updatePreferences = useCallback(
    (changes) => setPreferences((current) => ({ ...current, ...changes })),
    [],
  );

  return [preferences, updatePreferences];
}

export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
