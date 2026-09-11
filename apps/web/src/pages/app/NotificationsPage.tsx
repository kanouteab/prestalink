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
import { useTranslation } from '../../i18n/useTranslation';
import shared from '../shared.module.css';
import styles from './NotificationsPage.module.css';

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { data: unread, isLoading: isUnreadLoading } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();
  const { t } = useTranslation();

  return (
    <div className={shared.page} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>{t('notifications.title')}</h1>
        <p>
          {isUnreadLoading
            ? t('common.loading')
            : unread?.count
              ? t('notifications.unreadCount', { count: unread.count })
              : t('notifications.allCaughtUp')}
        </p>
      </header>

      {Boolean(unread?.count) && (
        <div className={shared.toolbar}>
          <Button variant="secondary" size="sm" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
            {t('notifications.markAllRead')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p>{t('common.loading')}</p>
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState title={t('notifications.emptyTitle')} message={t('notifications.emptyMessage')} />
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
                    {t('notifications.markRead')}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => remove.mutate(notification.id)}>
                  {t('notifications.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
