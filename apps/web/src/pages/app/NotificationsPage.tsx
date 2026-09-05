import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../../hooks/useNotifications';
import { notificationIcon } from '../../features/notifications/notificationDisplay';
import { Button, EmptyState } from '../../components';
import { formatRelativeDate } from '../../utils/format';
import shared from '../shared.module.css';
import styles from './NotificationsPage.module.css';

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { data: unread, isLoading: isUnreadLoading } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Notifications</h1>
        <p>{isUnreadLoading ? 'Chargement...' : unread?.count ? `${unread.count} notification(s) non lue(s).` : 'Vous etes a jour.'}</p>
      </header>

      {Boolean(unread?.count) && (
        <div className={shared.toolbar}>
          <Button variant="secondary" size="sm" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
            Tout marquer comme lu
          </Button>
        </div>
      )}

      {isLoading ? (
        <p>Chargement...</p>
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState title="Aucune notification" message="Vous serez notifie ici des nouveaux messages et de l'activite sur vos publications." />
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <div key={notification.id} className={[styles.item, !notification.isRead && styles.unread].filter(Boolean).join(' ')}>
              <span className={styles.icon}>{notificationIcon(notification.type)}</span>
              <div className={styles.body}>
                <div className={styles.title}>{notification.title}</div>
                <div className={styles.message}>{notification.message}</div>
                <div className={styles.time}>{formatRelativeDate(notification.createdAt)}</div>
              </div>
              <div className={styles.actions}>
                {!notification.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification.id)}>
                    Marquer lu
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => remove.mutate(notification.id)}>
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
