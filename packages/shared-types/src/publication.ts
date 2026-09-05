import type { UserResponse } from './user.js';
import type { ServiceCategory } from './category.js';

/**
 * Offre et Demande sont deux entites independantes cote backend (pas de table
 * `Publication` partagee) : ce type union sert uniquement a typer les endroits
 * du frontend qui traitent les deux de facon generique (favoris, recherche).
 */
export type PublicationType = 'OFFER' | 'REQUEST';

export type PublicationStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED' | 'EXPIRED';

interface PublicationBase {
  id: number;
  title: string;
  description: string;
  location: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  status: PublicationStatus;
  createdAt: string;
  category: ServiceCategory;
  photoUrls: string[];
}

export interface OfferResponse extends PublicationBase {
  price: number;
  active: boolean;
  provider: UserResponse;
}

export interface RequestResponse extends PublicationBase {
  budget: number;
  client: UserResponse;
}

export interface OfferInput {
  title: string;
  description: string;
  price: number;
  location: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  categoryId: number;
}

export interface RequestInput {
  title: string;
  description: string;
  budget: number;
  location: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  categoryId: number;
}

export interface FavoriteResponse {
  id: number;
  publicationType: PublicationType;
  publicationId: number;
  available: boolean;
  unavailableMessage?: string;
  offer?: OfferResponse;
  request?: RequestResponse;
}
