import type { UserResponse } from './user.js';
import type { RequestResponse } from './publication.js';

export type MissionStatus = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

/**
 * Une mission ne peut aujourd'hui naitre que d'une ServiceRequest (un prestataire
 * accepte une demande) : il n'existe pas de flux "un client accepte une offre".
 */
export interface MissionResponse {
  id: number;
  status: MissionStatus;
  startedAt?: string;
  finishedAt?: string;
  client: UserResponse;
  provider: UserResponse;
  request: RequestResponse;
}

export interface RatingSummary {
  average: number;
  count: number;
}

export interface ReviewResponse {
  id: number;
  missionId: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerId: number;
  reviewerName: string;
}

export interface ProviderTrustProfile {
  provider: UserResponse;
  ratingSummary: RatingSummary;
  trustScore: number;
  reviews: ReviewResponse[];
}
