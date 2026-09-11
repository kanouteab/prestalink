import { useTranslation } from '../../i18n/useTranslation.js';
import styles from './LanguageSwitcher.module.css';

/** Bascule FR/EN de l'interface — n'affecte pas le contenu saisi en base (publications, profils, banniere admin). */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className={styles.switcher} role="group" aria-label={t('languageSwitcher.ariaLabel')}>
      <button
        type="button"
        className={[styles.option, locale === 'fr' && styles.active].filter(Boolean).join(' ')}
        aria-pressed={locale === 'fr'}
        onClick={() => setLocale('fr')}
      >
        FR
      </button>
      <button
        type="button"
        className={[styles.option, locale === 'en' && styles.active].filter(Boolean).join(' ')}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  );
}
