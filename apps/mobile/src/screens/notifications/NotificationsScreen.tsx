import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../../hooks/useNotifications';
import { notificationIcon } from '../../features/notifications/notificationDisplay';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { formatRelativeDate } from '../../utils/format';
import { useTheme } from '../../theme/ThemeProvider';

export function NotificationsScreen() {
  const theme = useTheme();
  const { data: notifications, isLoading } = useNotifications();
  const { data: unread, isLoading: isUnreadLoading } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['bottom']}>
      <FlatList
        data={notifications}
        keyExtractor={(notification) => String(notification.id)}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        ListHeaderComponent={
          <View style={{ marginBottom: theme.spacing.md, gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '600', color: theme.colors.ink900 }}>Notifications</Text>
            <Text style={{ color: theme.colors.ink500 }}>
              {isUnreadLoading ? 'Chargement...' : unread?.count ? `${unread.count} notification(s) non lue(s).` : 'Vous etes a jour.'}
            </Text>
            {Boolean(unread?.count) && <Button label="Tout marquer comme lu" variant="secondary" size="sm" onPress={() => markAllRead.mutate()} />}
          </View>
        }
        renderItem={({ item: notification }) => (
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: notification.isRead ? theme.colors.surface1 : theme.colors.brandTint,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ fontSize: 16 }}>{notificationIcon(notification.type)}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontWeight: '700', fontSize: 13, color: theme.colors.ink900 }}>{notification.title}</Text>
              <Text style={{ fontSize: 12.5, color: theme.colors.ink500 }}>{notification.message}</Text>
              <Text style={{ fontSize: 11, color: theme.colors.ink300 }}>{formatRelativeDate(notification.createdAt)}</Text>
              {!notification.isRead && <Button label="Marquer lu" variant="ghost" size="sm" onPress={() => markRead.mutate(notification.id)} />}
            </View>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={theme.colors.brand} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState title="Aucune notification" message="Vous serez notifie ici des nouveaux messages et de l'activite sur vos publications." />
          )
        }
      />
    </SafeAreaView>
  );
}
