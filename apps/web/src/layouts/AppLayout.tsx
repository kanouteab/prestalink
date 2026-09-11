import { NavLink, Outlet } from 'react-router-dom';
import { Button, Logo, HomeIcon, SearchIcon, PlusCircleIcon, FileTextIcon, ReceiptIcon, MessageCircleIcon, HeartIcon } from '../components';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { useRealtimeConnection } from '../hooks/useRealtimeConnection';
import { useNotificationsRealtime } from '../hooks/useNotifications';
import { NotificationBell } from '../features/notifications/NotificationBell';
import styles from './AppLayout.module.css';

const NAV_ITEMS = [
  { to: '/app', label: 'Accueil', end: true, Icon: HomeIcon },
  { to: '/app/explorer', label: 'Explorer', Icon: SearchIcon },
  { to: '/app/publier', label: 'Publier', Icon: PlusCircleIcon },
  { to: '/app/publications', label: 'Mes publications', Icon: FileTextIcon },
  { to: '/app/missions', label: 'Missions', Icon: ReceiptIcon },
  { to: '/app/messages', label: 'Messages', Icon: MessageCircleIcon },
  { to: '/app/favoris', label: 'Favoris', Icon: HeartIcon },
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
          {NAV_ITEMS.map(({ Icon, ...item }) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? styles.active : undefined)}>
              <Icon size={18} />
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
