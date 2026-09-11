import { create } from 'zustand';

export type Locale = 'fr' | 'en';

const STORAGE_KEY = 'prestalink.locale';

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: readStoredLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // localStorage indisponible (navigation privee) : le choix reste actif pour la session en cours.
    }
    set({ locale });
  },
}));

/** Lecture hors composant React (formatters Intl dans utils/format.ts). */
export function getLocale(): Locale {
  return useLocaleStore.getState().locale;
}
