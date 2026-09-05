import type { ApiClient } from '../httpClient.js';
import type { ChatMessageResponse, PublicationType } from '@prestalink/shared-types';

export interface SendMessageInput {
  receiverId: number;
  content: string;
  conversationKey: string;
  missionId?: number;
  publicationType?: PublicationType;
  publicationId?: number;
  publicationTitle?: string;
}

export function createChatService(client: ApiClient) {
  return {
    send: (input: SendMessageInput) => client.post<ChatMessageResponse>('/api/chat/send', input),

    sendAttachment: (conversationId: string, file: File | Blob, input: Omit<SendMessageInput, 'conversationKey'>) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverId', String(input.receiverId));
      if (input.content) formData.append('content', input.content);
      if (input.publicationType) formData.append('publicationType', input.publicationType);
      if (input.publicationId) formData.append('publicationId', String(input.publicationId));
      if (input.publicationTitle) formData.append('publicationTitle', input.publicationTitle);
      return client.upload<ChatMessageResponse>(`/api/messages/${conversationId}/attachments`, formData);
    },

    missionThread: (missionId: number) => client.get<ChatMessageResponse[]>(`/api/chat/mission/${missionId}`, undefined, { auth: false }),

    missionThreadPaginated: (missionId: number, page: number, size: number) =>
      client.get<{ content: ChatMessageResponse[]; totalPages: number }>(
        `/api/chat/mission/${missionId}/paginated`,
        { page, size },
        { auth: false },
      ),

    conversation: (otherUserId: number, publicationType?: PublicationType, publicationId?: number) =>
      client.get<ChatMessageResponse[]>('/api/chat/conversation', { otherUserId, publicationType, publicationId }),

    readAllConversation: (conversationKey: string) =>
      client.put<void>('/api/chat/conversation/read-all', undefined, { query: { conversationKey } }),

    readAllMission: (missionId: number) => client.put<void>(`/api/chat/mission/${missionId}/read-all`),

    readMessage: (messageId: number) => client.put<void>(`/api/chat/messages/${messageId}/read`),

    unreadCountMission: (missionId: number) => client.get<{ count: number }>(`/api/chat/mission/${missionId}/unread-count`),

    editMessage: (messageId: number, content: string) =>
      client.put<ChatMessageResponse>(`/api/chat/messages/${messageId}`, undefined, { query: { content } }),

    deleteMessage: (messageId: number) => client.delete<void>(`/api/chat/messages/${messageId}`),

    typing: (missionId: number) => client.post<void>('/api/chat/typing', undefined, { query: { missionId } }),

    setPresence: (userId: number, online: boolean) =>
      client.post<void>(`/api/chat/presence/${userId}/${online ? 'online' : 'offline'}`),

    getPresence: (userId: number) =>
      client.get<{ userId: number; online: boolean; statusLabel: string }>(`/api/chat/users/${userId}/presence`, undefined, {
        auth: false,
      }),
  };
}

export type ChatService = ReturnType<typeof createChatService>;
