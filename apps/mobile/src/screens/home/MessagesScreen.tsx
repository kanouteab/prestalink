import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { readRecentConversations, type RecentConversation } from '../../services/recentConversations';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { useIsAuthenticated } from '../../store/authStore';
import { Button } from '../../components/Button/Button';
import { formatRelativeDate } from '../../utils/format';
import { useTheme } from '../../theme/ThemeProvider';

/** Conversations recentes en cache local (pas d'endpoint "mes conversations" cote backend, livrable H) — meme approche que le Web. */
export function MessagesScreen() {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<RecentConversation[]>([]);

  useFocusEffect(
    useCallback(() => {
      readRecentConversations().then(setConversations);
    }, []),
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0, padding: theme.spacing.xl, gap: theme.spacing.lg, justifyContent: 'center' }} edges={['top']}>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', color: theme.colors.ink900 }}>Connectez-vous pour voir vos messages</Text>
        <Button label="Se connecter" onPress={() => navigation.navigate('Login')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} edges={['top']}>
      <FlatList
        data={conversations}
        keyExtractor={(conversation) => conversation.conversationKey}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        ListHeaderComponent={<Text style={{ fontSize: 22, fontWeight: '600', color: theme.colors.ink900, marginBottom: 8 }}>Messages</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Chat', item)}
            style={{ padding: theme.spacing.lg, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface1, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Text style={{ fontWeight: '700', color: theme.colors.ink900 }}>{item.otherUserName}</Text>
            <Text style={{ fontSize: 12.5, color: theme.colors.ink500, marginTop: 2 }}>
              {item.publicationTitle} · {formatRelativeDate(item.lastMessageAt)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            glyph="💬"
            title="Aucune conversation"
            message="Contactez un prestataire ou un client depuis le detail d'une publication pour demarrer une conversation."
          />
        }
      />
    </SafeAreaView>
  );
}
