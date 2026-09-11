import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import shared from './shared.module.css';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className={shared.narrow}>
      <header className={shared.pageHeader}>
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.message')}</p>
      </header>
      <Link to="/">{t('notFound.backHome')}</Link>
    </div>
  );
}
