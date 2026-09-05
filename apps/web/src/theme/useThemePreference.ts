import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'prestalink-theme';

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // localStorage indisponible (navigation privee, etc.) : on retombe sur "system".
  }
  return 'system';
}

/** Pilote l'attribut `data-theme` attendu par packages/design-tokens/tokens.css. */
export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference);

  useEffect(() => {
    const root = document.documentElement;
    if (preference === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', preference);

    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // best effort
    }
  }, [preference]);

  const cyclePreference = useCallback(() => {
    setPreference((current) => (current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system'));
  }, []);

  return { preference, setPreference, cyclePreference };
}
