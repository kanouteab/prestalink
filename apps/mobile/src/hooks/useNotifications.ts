import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { realtimeTopics } from '@prestalink/api-client';
import type { UserNotificationRealtimeEvent } from '@prestalink/shared-types';
import { api } from '../services/apiClient';
import { realtimeClient } from '../services/realtime';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
  const isAuthenticated = Boolean(useAuthStore((state) => state.token));
  return useQuery({ queryKey: ['notifications', 'mine'], queryFn: () => api.notifications.mine(), enabled: isAuthenticated });
}

export function useUnreadNotificationCount() {
  const isAuthenticated = Boolean(useAuthStore((state) => state.token));
  return useQuery({ queryKey: ['notifications', 'unread-count'], queryFn: () => api.notifications.unreadCount(), enabled: isAuthenticated });
}

export function useNotificationsRealtime() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;
    return realtimeClient.subscribe<UserNotificationRealtimeEvent>(realtimeTopics.userNotifications(currentUserId), () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
  }, [currentUserId, queryClient]);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
