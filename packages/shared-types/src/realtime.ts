/**
 * Payloads exacts des 9 topics STOMP emis par le backend (WebSocketConfig +
 * SimpMessagingTemplate) — voir com.prestalink.api.websocket.*Event. Le canal
 * est serveur -> client uniquement : aucun `@MessageMapping` n'existe, toute
 * ecriture passe par REST (livrable H).
 */

export interface ChatRealtimeEvent {
  type: string;
  missionId?: number;
  conversationKey: string;
  messageId: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  content: string;
  status: string;
  publicationType?: string;
  publicationId?: number;
  publicationTitle?: string;
  attachmentFileName?: string;
  attachmentFileType?: string;
  attachmentFileSize?: number;
  attachmentUrl?: string;
}

export interface TypingRealtimeEvent {
  type: string;
  missionId?: number;
  userId: number;
  userName: string;
}

export interface ChatReadRealtimeEvent {
  type: string;
  missionId?: number;
  messageId: number;
  readerId: number;
}

export interface ChatUpdateRealtimeEvent {
  type: string;
  missionId?: number;
  messageId: number;
  senderId: number;
  content: string;
}

export interface UnreadCountRealtimeEvent {
  type: string;
  missionId?: number;
  readerId: number;
  unreadCount: number;
}

export interface PresenceRealtimeEvent {
  type: string;
  userId: number;
  online: boolean;
  statusLabel: string;
}

export interface UserNotificationRealtimeEvent {
  type: string;
  userId: number;
  title: string;
  message: string;
}

export interface FeedRealtimeEvent {
  type: 'OFFERS_FEED_UPDATED' | 'REQUESTS_FEED_UPDATED' | 'PROVIDERS_FEED_UPDATED';
  message?: string;
}
