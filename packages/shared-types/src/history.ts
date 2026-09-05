import type { PublicationType } from './publication.js';

export type HistoryStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface ServiceHistoryItemResponse {
  direction: 'PROVIDED' | 'REQUESTED';
  title: string;
  description: string;
  status: HistoryStatus;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  providerId: number;
  providerName: string;
  clientId: number;
  clientName: string;
  otherUserId: number;
  otherUserName: string;
  /** Toujours vide aujourd'hui : l'historique ne provient que des missions (issues de demandes). */
  offerId?: number;
  requestId?: number;
  publicationType: PublicationType;
}
