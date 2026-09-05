import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { realtimeTopics } from '@prestalink/api-client';
import type { ChatMessageResponse, ChatRealtimeEvent } from '@prestalink/shared-types';
import { api } from '../services/apiClient';
import { realtimeClient } from '../services/realtime';
import { useAuthStore } from '../store/authStore';
import type { ChatContext } from '../features/chat/types';

function conversationQueryKey(conversationKey: string) {
  return ['chat', 'conversation', conversationKey];
}

/** Charge une conversation et l'actualise en temps reel via le topic /topic/users/{id}/chat. */
export function useConversation(context: ChatContext) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const queryKey = conversationQueryKey(context.conversationKey);

  const query = useQuery({
    queryKey,
    queryFn: () => api.chat.conversation(context.otherUserId, context.publicationType, context.publicationId),
    enabled: Boolean(currentUserId),
  });

  useEffect(() => {
    if (!currentUserId) return;
    return realtimeClient.subscribe<ChatRealtimeEvent>(realtimeTopics.userChat(currentUserId), (event) => {
      if (event.conversationKey !== context.conversationKey) return;
      const incoming: ChatMessageResponse = {
        id: event.messageId,
        missionId: event.missionId,
        conversationKey: event.conversationKey,
        senderId: event.senderId,
        senderName: event.senderName,
        receiverId: event.receiverId,
        receiverName: event.receiverId === currentUserId ? '' : context.otherUserName,
        content: event.content,
        isRead: false,
        isEdited: false,
        status: event.status as ChatMessageResponse['status'],
        sentAt: new Date().toISOString(),
        publicationType: context.publicationType,
        publicationId: context.publicationId,
        publicationTitle: context.publicationTitle,
        attachmentFileName: event.attachmentFileName,
        attachmentFileType: event.attachmentFileType,
        attachmentFileSize: event.attachmentFileSize,
        attachmentUrl: event.attachmentUrl,
      };
      queryClient.setQueryData<ChatMessageResponse[]>(queryKey, (current) => {
        if (!current) return [incoming];
        if (current.some((message) => message.id === incoming.id)) return current;
        return [...current, incoming];
      });
    });
  }, [currentUserId, context.conversationKey, context.otherUserName, context.publicationType, context.publicationId, context.publicationTitle, queryClient, queryKey]);

  return query;
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { context: ChatContext; content: string }) =>
      api.chat.send({
        receiverId: params.context.otherUserId,
        content: params.content,
        conversationKey: params.context.conversationKey,
        publicationType: params.context.publicationType,
        publicationId: params.context.publicationId,
        publicationTitle: params.context.publicationTitle,
      }),
    onSuccess: (message, params) => {
      queryClient.setQueryData<ChatMessageResponse[]>(conversationQueryKey(params.context.conversationKey), (current) =>
        current ? [...current, message] : [message],
      );
    },
  });
}
