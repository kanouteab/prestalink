import type { ApiClient } from '../httpClient.js';
import type { OfferInput, OfferResponse, PublicationStatus } from '@prestalink/shared-types';

export function createOfferService(client: ApiClient) {
  return {
    /** Endpoint DTO propre, recommande pour tout affichage (feed/liste). */
    feed: (location?: string) => client.get<OfferResponse[]>('/api/offers/feed', { location }, { auth: false }),

    active: () => client.get<OfferResponse[]>('/api/offers/active', undefined, { auth: false }),

    get: (id: number) => client.get<OfferResponse>(`/api/offers/${id}`, undefined, { auth: false }),

    create: (input: OfferInput) =>
      client.post<OfferResponse>('/api/offers', input, { query: { categoryId: input.categoryId } }),

    update: (id: number, input: OfferInput) =>
      client.put<OfferResponse>(`/api/offers/${id}`, input, { query: { categoryId: input.categoryId } }),

    updateStatus: (id: number, status: PublicationStatus) =>
      client.put<OfferResponse>(`/api/offers/${id}/status`, undefined, { query: { status } }),

    remove: (id: number) => client.delete<void>(`/api/offers/${id}`),

    registerView: (id: number) => client.post<void>(`/api/offers/${id}/view`, undefined, { auth: false }),

    /** Champ de formulaire canonique cote backend : `images` (accepte aussi photos/files/image). */
    uploadPhotos: (id: number, files: File[] | Blob[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      return client.upload<OfferResponse>(`/api/offers/${id}/photos`, formData);
    },
  };
}

export type OfferService = ReturnType<typeof createOfferService>;
