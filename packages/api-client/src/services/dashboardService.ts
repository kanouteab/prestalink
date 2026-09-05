import type { ApiClient } from '../httpClient.js';

export interface DashboardSummary {
  totalUsers: number;
  totalClients: number;
  totalProviders: number;
  totalCategories: number;
  totalOffers: number;
  activeOffers: number;
  totalRequests: number;
  pendingRequests: number;
  cancelledRequests: number;
  activeMissions: number;
  finishedMissions: number;
  cancelledMissions: number;
  [key: string]: number;
}

export function createDashboardService(client: ApiClient) {
  return {
    /** Agregat global (livrable H) : pas encore de version scopee par utilisateur cote backend. */
    summary: () => client.get<DashboardSummary>('/api/dashboard', undefined, { auth: false }),
  };
}

export type DashboardService = ReturnType<typeof createDashboardService>;
