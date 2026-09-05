import type { PublicationType } from '@prestalink/shared-types';

export interface ChatContext {
  conversationKey: string;
  otherUserId: number;
  otherUserName: string;
  publicationType: PublicationType;
  publicationId: number;
  publicationTitle: string;
}
