import type { ApiClient } from '../httpClient.js';
import type { UserResponse, UserRole, UserStatus } from '@prestalink/shared-types';

export function createUserService(client: ApiClient) {
  return {
    list: () => client.get<UserResponse[]>('/api/users', undefined, { auth: false }),

    byRole: (role: UserRole) => client.get<UserResponse[]>(`/api/users/role/${role}`, undefined, { auth: false }),

    availableProviders: () => client.get<UserResponse[]>('/api/users/providers/available', undefined, { auth: false }),

    providersFeed: () => client.get<UserResponse[]>('/api/users/providers/feed', undefined, { auth: false }),

    updateStatus: (userId: number, status: UserStatus) =>
      client.put<UserResponse>(`/api/users/${userId}/status`, undefined, { query: { status } }),

    /** Sert aussi a fixer le role (CLIENT/PRESTATAIRE) tant que l'inscription ne l'accepte pas. */
    update: (id: number, payload: Partial<UserResponse>) => client.put<UserResponse>(`/api/users/${id}`, payload),

    uploadPhoto: (file: File | Blob) => {
      const formData = new FormData();
      formData.append('image', file);
      return client.upload<UserResponse>('/api/users/me/photo', formData);
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
