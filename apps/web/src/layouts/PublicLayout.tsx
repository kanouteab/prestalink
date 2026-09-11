import { NavLink, Outlet } from 'react-router-dom';
import { LanguageSwitcher, LinkButton, Logo } from '../components';
import { useIsAuthenticated } from '../store/authStore';
import { useTranslation } from '../i18n/useTranslation';
import styles from './PublicLayout.module.css';

export function PublicLayout() {
  const isAuthenticated = useIsAuthenticated();
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/explorer', label: t('nav.explore') },
    { to: '/demandes', label: t('nav.requests') },
    { to: '/offres', label: t('nav.offers') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/a-propos', label: t('nav.about') },
  ];

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand}>
          <Logo />
        </NavLink>
        <nav className={styles.nav} aria-label="Navigation principale">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? styles.active : undefined)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <LinkButton to="/app" variant="primary" size="sm">
              {t('nav.myAccount')}
            </LinkButton>
          ) : (
            <>
              <LinkButton to="/connexion" variant="ghost" size="sm">
                {t('nav.login')}
              </LinkButton>
              <LinkButton to="/inscription" variant="primary" size="sm">
                {t('nav.register')}
              </LinkButton>
            </>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>{t('footer.tagline')}</footer>
    </div>
  );
}
