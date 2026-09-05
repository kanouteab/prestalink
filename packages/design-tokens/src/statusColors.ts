/**
 * Association statut metier -> role de couleur semantique, utilisee par les
 * badges (offres/demandes/missions). Garde ici plutot que dans shared-types
 * pour que design-tokens reste la seule source de verite visuelle.
 */
export type StatusColorRole = 'success' | 'brand' | 'neutral' | 'danger';

export const publicationStatusColor: Record<string, StatusColorRole> = {
  AVAILABLE: 'success',
  IN_PROGRESS: 'brand',
  COMPLETED: 'neutral',
  SUSPENDED: 'danger',
  EXPIRED: 'danger',
};

export const missionStatusColor: Record<string, StatusColorRole> = {
  EN_ATTENTE: 'neutral',
  EN_COURS: 'brand',
  TERMINEE: 'success',
  ANNULEE: 'danger',
};

export const publicationTypeColor = {
  OFFER: 'offre',
  REQUEST: 'demande',
} as const;
