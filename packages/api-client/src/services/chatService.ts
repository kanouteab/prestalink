import type { ApiClient } from '../httpClient.js';
import type { ChatMessageResponse, PublicationType } from '@prestalink/shared-types';

export interface SendMessageInput {
  senderId: number;
  receiverId: number;
  content: string;
  conversationKey: string;
  missionId?: number;
  publicationType?: PublicationType;
  publicationId?: number;
  publicationTitle?: string;
}

/**
 * Aucun endpoint de /api/chat ne lit un jeton/en-tete d'authentification :
 * chacun attend l'id de l'utilisateur courant explicitement (senderId,
 * userId ou readerId selon l'action) — a fournir a chaque appel plutot que
 * de compter sur une session serveur (livrable H).
 */
export function createChatService(client: ApiClient) {
  return {
    send: (input: SendMessageInput) => client.post<ChatMessageResponse>('/api/chat/send', input),

    sendAttachment: (conversationId: string, file: File | Blob, input: Omit<SendMessageInput, 'conversationKey'>) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('senderId', String(input.senderId));
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

    conversation: (userId: number, otherUserId: number, publicationType?: PublicationType, publicationId?: number) =>
      client.get<ChatMessageResponse[]>('/api/chat/conversation', { userId, otherUserId, publicationType, publicationId }),

    readAllConversation: (conversationKey: string, readerId: number) =>
      client.put<ChatMessageResponse[]>('/api/chat/conversation/read-all', undefined, { query: { conversationKey, readerId } }),

    readAllMission: (missionId: number, readerId: number) =>
      client.put<ChatMessageResponse[]>(`/api/chat/mission/${missionId}/read-all`, undefined, { query: { readerId } }),

    readMessage: (messageId: number, readerId: number) =>
      client.put<ChatMessageResponse>(`/api/chat/messages/${messageId}/read`, undefined, { query: { readerId } }),

    unreadCountMission: (missionId: number, readerId: number) =>
      client.get<number>(`/api/chat/mission/${missionId}/unread-count`, { readerId }),

    editMessage: (messageId: number, userId: number, content: string) =>
      client.put<ChatMessageResponse>(`/api/chat/messages/${messageId}`, undefined, { query: { userId, content } }),

    deleteMessage: (messageId: number, userId: number) => client.delete<void>(`/api/chat/messages/${messageId}`, { query: { userId } }),

    typing: (missionId: number, userId: number, userName: string) =>
      client.post<void>('/api/chat/typing', undefined, { query: { missionId, userId, userName } }),

    setPresence: (userId: number, online: boolean) =>
      client.post<void>(`/api/chat/presence/${userId}/${online ? 'online' : 'offline'}`),

    getPresence: (userId: number) =>
      client.get<{ userId: number; online: boolean; statusLabel: string }>(`/api/chat/users/${userId}/presence`, undefined, {
        auth: false,
      }),
  };
}

export type ChatService = ReturnType<typeof createChatService>;
