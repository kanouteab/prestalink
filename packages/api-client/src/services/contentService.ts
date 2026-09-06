import type { ApiClient } from '../httpClient.js';
import type { BrandingSettingsResponse, HomeBannerResponse } from '@prestalink/shared-types';

/** Lecture seule des endpoints publics du back-office (pas les CRUD /api/admin/*, hors perimetre). */
export function createContentService(client: ApiClient) {
  return {
    activeBanner: () => client.get<HomeBannerResponse>('/api/admin/banners/active', undefined, { auth: false }),
    activeBranding: () => client.get<BrandingSettingsResponse>('/api/admin/branding/active', undefined, { auth: false }),
  };
}

export type ContentService = ReturnType<typeof createContentService>;
