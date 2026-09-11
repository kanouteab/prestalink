import { useLocaleStore, type Locale } from './localeStore.js';
import { fr } from './translations/fr.js';
import { en } from './translations/en.js';

const dictionaries = { fr, en };

type Vars = Record<string, string | number>;

function resolve(path: string, locale: Locale): string {
  const parts = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = dictionaries[locale];
  for (const part of parts) {
    node = node?.[part];
  }
  if (typeof node === 'string') return node;
  return path;
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

/** Cle en notation pointee, ex. `t('missions.cancelDialogMessage', { title })`. */
export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const t = (key: string, vars?: Vars): string => interpolate(resolve(key, locale), vars);

  return { t, locale, setLocale };
}
