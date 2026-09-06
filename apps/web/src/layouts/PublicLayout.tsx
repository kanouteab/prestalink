import { NavLink, Outlet } from 'react-router-dom';
import { LinkButton, Logo } from '../components';
import { useIsAuthenticated } from '../store/authStore';
import styles from './PublicLayout.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/explorer', label: 'Explorer' },
  { to: '/demandes', label: 'Demandes disponibles' },
  { to: '/offres', label: 'Offres disponibles' },
  { to: '/contact', label: 'Contact' },
  { to: '/a-propos', label: 'A propos' },
];

export function PublicLayout() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand}>
          <Logo />
        </NavLink>
        <nav className={styles.nav} aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? styles.active : undefined)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          {isAuthenticated ? (
            <LinkButton to="/app" variant="primary" size="sm">
              Mon espace
            </LinkButton>
          ) : (
            <>
              <LinkButton to="/connexion" variant="ghost" size="sm">
                Connexion
              </LinkButton>
              <LinkButton to="/inscription" variant="primary" size="sm">
                Inscription
              </LinkButton>
            </>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>PrestaLink — marketplace de services locale</footer>
    </div>
  );
}
