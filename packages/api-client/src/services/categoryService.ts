import type { ApiClient } from '../httpClient.js';
import type { ServiceCategory } from '@prestalink/shared-types';

export function createCategoryService(client: ApiClient) {
  return {
    list: () => client.get<ServiceCategory[]>('/api/categories', undefined, { auth: false }),
  };
}

export type CategoryService = ReturnType<typeof createCategoryService>;
