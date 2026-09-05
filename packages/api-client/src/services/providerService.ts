import type { ApiClient } from '../httpClient.js';
import type { ProviderTrustProfile, RatingSummary, ReviewResponse, UserResponse } from '@prestalink/shared-types';

export function createProviderService(client: ApiClient) {
  return {
    recommended: (location?: string) => client.get<UserResponse[]>('/api/providers/recommended', { location }, { auth: false }),

    createReview: (providerId: number, payload: { missionId: number; rating: number; comment?: string }) =>
      client.post<ReviewResponse>(`/api/providers/${providerId}/reviews`, payload),

    reviews: (providerId: number) => client.get<ReviewResponse[]>(`/api/providers/${providerId}/reviews`, undefined, { auth: false }),

    ratingSummary: (providerId: number) =>
      client.get<RatingSummary>(`/api/providers/${providerId}/rating-summary`, undefined, { auth: false }),

    trustProfile: (providerId: number) =>
      client.get<ProviderTrustProfile>(`/api/providers/${providerId}/trust-profile`, undefined, { auth: false }),
  };
}

export type ProviderService = ReturnType<typeof createProviderService>;
