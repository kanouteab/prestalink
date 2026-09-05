/**
 * Le backend cree aujourd'hui les comptes avec `role: null` (POST /api/auth/register
 * ne recoit pas de role) ; le role n'est fixe qu'via un PUT /api/users/{id} ulterieur.
 * D'ou le `| null` ci-dessous, qui doit disparaitre une fois le correctif backend
 * du livrable H applique (role accepte des l'inscription).
 */
export type UserRole = 'CLIENT' | 'PRESTATAIRE' | 'ADMIN';

export type UserStatus = 'DISPONIBLE' | 'EN_ATTENTE' | 'OCCUPE' | 'EN_COURS_PRESTATION' | 'HORS_LIGNE';

export type AccountStatus = 'ACTIF' | 'COMPTE_GELE_TEMPORAIRE' | 'COMPTE_SUSPENDU_TEMPORAIRE';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole | null;
  status: UserStatus;
  latitude?: number;
  longitude?: number;
  rating: number;
  ratingAverage: number;
  ratingCount: number;
  trustScore: number;
  completedServices: number;
  verifiedProfile: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: AccountStatus;
  accountStatusLabel: string;
  fullyVerifiedProfile: boolean;
  newProvider: boolean;
  selectable: boolean;
  trustBadge: string | null;
  country?: string;
  city?: string;
  streetAddress?: string;
  postalCode?: string;
  photoUrl?: string;
}
