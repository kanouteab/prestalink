import type { ApiClient } from '../httpClient.js';
import type { FavoriteResponse, PublicationType } from '@prestalink/shared-types';

export function createFavoriteService(client: ApiClient) {
  return {
    mine: () => client.get<FavoriteResponse[]>('/api/favorites/me'),

    add: (publicationType: PublicationType, publicationId: number) =>
      client.post<FavoriteResponse>('/api/favorites', { publicationType, publicationId }),

    remove: (publicationType: PublicationType, publicationId: number) =>
      client.delete<void>(`/api/favorites/${publicationType}/${publicationId}`),

    status: (publicationType: PublicationType, publicationId: number) =>
      client.get<{ favorite: boolean }>(`/api/favorites/status/${publicationType}/${publicationId}`),
  };
}

export type FavoriteService = ReturnType<typeof createFavoriteService>;
