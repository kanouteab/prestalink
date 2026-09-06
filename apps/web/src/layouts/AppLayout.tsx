import { NavLink, Outlet } from 'react-router-dom';
import { Button, Logo } from '../components';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { useRealtimeConnection } from '../hooks/useRealtimeConnection';
import { useNotificationsRealtime } from '../hooks/useNotifications';
import { NotificationBell } from '../features/notifications/NotificationBell';
import styles from './AppLayout.module.css';

const NAV_ITEMS = [
  { to: '/app', label: 'Accueil', end: true, icon: '🏠' },
  { to: '/app/explorer', label: 'Explorer', icon: '🔍' },
  { to: '/app/publier', label: 'Publier', icon: '➕' },
  { to: '/app/publications', label: 'Mes publications', icon: '📄' },
  { to: '/app/missions', label: 'Missions', icon: '🧾' },
  { to: '/app/messages', label: 'Messages', icon: '💬' },
  { to: '/app/favoris', label: 'Favoris', icon: '♥' },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  useRealtimeConnection();
  useNotificationsRealtime();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink to="/" className={styles.brand}>
          <Logo />
        </NavLink>
        <nav className={styles.sidebarNav} aria-label="Navigation de l'espace connecte">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? styles.active : undefined)}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFoot}>
          {user && (
            <NavLink to="/app/profil" className={styles.profileLink}>
              <div className={styles.userName}>{user.fullName}</div>
              <div className={styles.userRole}>{user.role === 'PRESTATAIRE' ? 'Prestataire' : 'Client'}</div>
            </NavLink>
          )}
          <Button variant="secondary" size="sm" onClick={() => logout.mutate()} loading={logout.isPending}>
            Se deconnecter
          </Button>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.topbar}>
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
