import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className={shared.narrow}>
      <header className={shared.pageHeader}>
        <h1>{t('about.title')}</h1>
        <p>{t('about.subtitle')}</p>
      </header>
      <p>{t('about.body')}</p>
    </div>
  );
}
