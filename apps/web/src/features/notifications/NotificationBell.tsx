import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NotificationResponse } from '@prestalink/shared-types';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../../hooks/useNotifications';
import { formatRelativeDate } from '../../utils/format';
import { notificationIcon } from './notificationDisplay';
import { BellIcon } from '../../components';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './NotificationBell.module.css';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useNotifications();
  const { data: unread } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const onItemClick = (notification: NotificationResponse) => {
    if (!notification.isRead) markRead.mutate(notification.id);
  };

  const recent = notifications?.slice(0, 8);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} aria-label={t('notifications.ariaLabel')} aria-expanded={open}>
        <BellIcon size={18} />
        {Boolean(unread?.count) && <span className={styles.dot}>{unread!.count > 9 ? '9+' : unread!.count}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.panelHead}>
            <h3>{t('notifications.title')}</h3>
            {Boolean(unread?.count) && <button onClick={() => markAllRead.mutate()}>{t('notifications.markAllRead')}</button>}
          </div>

          {!recent || recent.length === 0 ? (
            <div className={styles.item}>{t('notifications.empty')}</div>
          ) : (
            recent.map((notification) => (
              <button
                key={notification.id}
                className={[styles.item, !notification.isRead && styles.unread].filter(Boolean).join(' ')}
                onClick={() => onItemClick(notification)}
              >
                <span className={styles.itemIcon}>{notificationIcon(notification.type)}</span>
                <span>
                  <div className={styles.itemTitle}>{notification.title}</div>
                  <div className={styles.itemMessage}>{notification.message}</div>
                  <div className={styles.itemTime}>{formatRelativeDate(notification.createdAt)}</div>
                </span>
              </button>
            ))
          )}

          <div className={styles.panelFoot}>
            <Link to="/app/notifications" onClick={() => setOpen(false)}>
              {t('notifications.seeAll')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
