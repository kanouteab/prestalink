import type { ApiClient } from '../httpClient.js';
import type { PublicationType } from '@prestalink/shared-types';

export interface CreateReportInput {
  targetType: 'USER' | 'PUBLICATION';
  reason: 'SPAM' | 'SCAM' | 'INAPPROPRIATE_CONTENT';
  reportedUserId?: number;
  publicationType?: PublicationType;
  publicationId?: number;
  details?: string;
}

export function createReportService(client: ApiClient) {
  return {
    /** Ecriture seule aujourd'hui : pas de `mine()` cote backend (livrable H). */
    create: (payload: CreateReportInput) => client.post<void>('/api/reports', payload),
  };
}

export type ReportService = ReturnType<typeof createReportService>;
