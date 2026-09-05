import type { ApiClient } from '../httpClient.js';
import type { ServiceHistoryItemResponse, HistoryStatus } from '@prestalink/shared-types';

export function createHistoryService(client: ApiClient) {
  return {
    mine: () =>
      client.get<{ providedServices: ServiceHistoryItemResponse[]; requestedServices: ServiceHistoryItemResponse[] }>(
        '/api/history/me',
      ),

    updateStatus: (id: number, status: HistoryStatus) =>
      client.put<void>(`/api/history/${id}/status`, undefined, { query: { status } }),
  };
}

export type HistoryService = ReturnType<typeof createHistoryService>;
