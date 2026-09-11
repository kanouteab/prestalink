import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';

export function ContactPage() {
  const { t } = useTranslation();
  return (
    <div className={shared.narrow}>
      <header className={shared.pageHeader}>
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.subtitle')}</p>
      </header>
      <p>
        {t('contact.supportLabel')} : <a href="mailto:contact@prestalink.example">contact@prestalink.example</a>
      </p>
      <p>{t('contact.responseTime')}</p>
    </div>
  );
}
