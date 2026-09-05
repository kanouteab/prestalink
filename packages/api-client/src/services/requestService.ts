import type { ApiClient } from '../httpClient.js';
import type { RequestInput, RequestResponse, PublicationStatus } from '@prestalink/shared-types';

export function createRequestService(client: ApiClient) {
  return {
    list: (params?: { providerId?: number; location?: string }) =>
      client.get<RequestResponse[]>('/api/requests', params, { auth: false }),

    pending: () => client.get<RequestResponse[]>('/api/requests/pending', undefined, { auth: false }),

    get: (id: number) => client.get<RequestResponse>(`/api/requests/${id}`, undefined, { auth: false }),

    create: (input: RequestInput) =>
      client.post<RequestResponse>('/api/requests', input, { query: { categoryId: input.categoryId } }),

    update: (id: number, input: RequestInput) =>
      client.put<RequestResponse>(`/api/requests/${id}`, input, { query: { categoryId: input.categoryId } }),

    updateStatus: (id: number, status: PublicationStatus) =>
      client.put<RequestResponse>(`/api/requests/${id}/status`, undefined, { query: { status } }),

    /**
     * ATTENTION (livrable H) : cet endpoint n'a aujourd'hui aucun controle
     * d'authentification/propriete cote backend. A ne pas exposer sans
     * confirmation/correctif serveur.
     */
    cancel: (id: number) => client.put<void>(`/api/requests/${id}/cancel`),

    remove: (id: number) => client.delete<void>(`/api/requests/${id}`),

    registerView: (id: number) => client.post<void>(`/api/requests/${id}/view`, undefined, { auth: false }),

    uploadPhotos: (id: number, files: File[] | Blob[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      return client.upload<RequestResponse>(`/api/requests/${id}/photos`, formData);
    },
  };
}

export type RequestService = ReturnType<typeof createRequestService>;
