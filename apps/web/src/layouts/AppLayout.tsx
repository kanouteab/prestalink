import { NavLink, Outlet } from 'react-router-dom';
import {
  Button,
  LanguageSwitcher,
  Logo,
  HomeIcon,
  SearchIcon,
  PlusCircleIcon,
  FileTextIcon,
  ReceiptIcon,
  MessageCircleIcon,
  HeartIcon,
} from '../components';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { useRealtimeConnection } from '../hooks/useRealtimeConnection';
import { useNotificationsRealtime } from '../hooks/useNotifications';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { useTranslation } from '../i18n/useTranslation';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { t } = useTranslation();
  useRealtimeConnection();
  useNotificationsRealtime();

  const navItems = [
    { to: '/app', label: t('appNav.home'), end: true, Icon: HomeIcon },
    { to: '/app/explorer', label: t('appNav.explore'), Icon: SearchIcon },
    { to: '/app/publier', label: t('appNav.publish'), Icon: PlusCircleIcon },
    { to: '/app/publications', label: t('appNav.myPublications'), Icon: FileTextIcon },
    { to: '/app/missions', label: t('appNav.missions'), Icon: ReceiptIcon },
    { to: '/app/messages', label: t('appNav.messages'), Icon: MessageCircleIcon },
    { to: '/app/favoris', label: t('appNav.favorites'), Icon: HeartIcon },
  ];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink to="/" className={styles.brand}>
          <Logo />
        </NavLink>
        <nav className={styles.sidebarNav} aria-label={t('appNav.ariaLabel')}>
          {navItems.map(({ Icon, ...item }) => (
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
              <div className={styles.userRole}>{user.role === 'PRESTATAIRE' ? t('appNav.provider') : t('appNav.client')}</div>
            </NavLink>
          )}
          <Button variant="secondary" size="sm" onClick={() => logout.mutate()} loading={logout.isPending}>
            {t('appNav.logout')}
          </Button>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.topbar}>
          <LanguageSwitcher />
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
