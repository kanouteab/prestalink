import type { ApiClient } from '../httpClient.js';
import type { NotificationResponse } from '@prestalink/shared-types';

export function createNotificationService(client: ApiClient) {
  return {
    mine: () => client.get<NotificationResponse[]>('/api/notifications/me'),

    unreadCount: () => client.get<{ count: number }>('/api/notifications/me/unread-count'),

    markRead: (id: number) => client.put<void>(`/api/notifications/${id}/read`),

    markAllRead: () => client.put<void>('/api/notifications/read-all'),

    remove: (id: number) => client.delete<void>(`/api/notifications/${id}`),
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
