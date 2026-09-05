import type { PublicationType } from './publication.js';

export type ChatMessageStatus = 'Envoye' | 'Distribue' | 'Lu';

/**
 * Deux natures de conversation partagent la meme table cote backend :
 * - conversationKey = "mission:{id}"                       -> chat lie a une mission
 * - conversationKey = "direct:{minId}:{maxId}:{type}:{id}" -> message libre lie a une publication
 */
export interface ChatMessageResponse {
  id: number;
  missionId?: number;
  conversationKey: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  isRead: boolean;
  isEdited: boolean;
  status: ChatMessageStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  publicationType?: PublicationType;
  publicationId?: number;
  publicationTitle?: string;
  attachmentFileName?: string;
  attachmentFileType?: string;
  attachmentFileSize?: number;
  attachmentUrl?: string;
  attachmentCreatedAt?: string;
}
