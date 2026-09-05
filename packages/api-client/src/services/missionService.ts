import type { ApiClient } from '../httpClient.js';
import type { MissionResponse } from '@prestalink/shared-types';

export function createMissionService(client: ApiClient) {
  return {
    list: () => client.get<MissionResponse[]>('/api/missions', undefined, { auth: false }),

    active: () => client.get<MissionResponse[]>('/api/missions/active', undefined, { auth: false }),

    create: (params: { clientId: number; providerId: number; requestId: number }) =>
      client.post<MissionResponse>('/api/missions', undefined, { query: params }),

    cancel: (missionId: number) => client.put<MissionResponse>(`/api/missions/${missionId}/cancel`),

    finish: (missionId: number) => client.put<MissionResponse>(`/api/missions/${missionId}/finish`),
  };
}

export type MissionService = ReturnType<typeof createMissionService>;
