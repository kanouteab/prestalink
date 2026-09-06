import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useConversation, useSendChatMessage } from '../../hooks/useChat';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/apiClient';
import { upsertRecentConversation } from '../../services/recentConversations';
import { Button } from '../../components/Button/Button';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function ChatScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const context = route.params;
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: messages } = useConversation(context);
  const sendMessage = useSendChatMessage();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: true, title: context.otherUserName });
    upsertRecentConversation({ ...context, lastMessageAt: new Date().toISOString() });
    if (currentUserId) api.chat.readAllConversation(context.conversationKey, currentUserId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.conversationKey, currentUserId]);

  const onSend = () => {
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    sendMessage.mutate({ context, content });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(message) => String(message.id)}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item: message }) => {
          const mine = message.senderId === currentUserId;
          return (
            <View style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <View
                style={{
                  maxWidth: '75%',
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: theme.radius.lg,
                  backgroundColor: mine ? theme.colors.brand : theme.colors.surface2,
                }}
              >
                <Text style={{ color: mine ? '#fff' : theme.colors.ink900, fontSize: 14 }}>{message.content}</Text>
              </View>
              <Text style={{ fontSize: 10.5, color: theme.colors.ink300, marginTop: 3 }}>{timeFormatter.format(new Date(message.sentAt))}</Text>
            </View>
          );
        }}
      />
      <View style={{ flexDirection: 'row', gap: 8, padding: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface1 }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ecrire un message..."
          placeholderTextColor={theme.colors.ink300}
          style={{
            flex: 1,
            borderWidth: 1.5,
            borderColor: theme.colors.borderStrong,
            borderRadius: theme.radius.sm,
            paddingVertical: 8,
            paddingHorizontal: 12,
            color: theme.colors.ink900,
          }}
        />
        <Button label="Envoyer" onPress={onSend} loading={sendMessage.isPending} disabled={!draft.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}
