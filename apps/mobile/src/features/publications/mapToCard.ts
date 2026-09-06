import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import type { PublicationCardProps } from '../../components/PublicationCard/PublicationCard';
import { initials } from '../../utils/format';

type FavoriteState = { favorite: boolean; pending: boolean; onToggle: () => void };

export function mapOfferToCard(offer: OfferResponse, favoriteState?: FavoriteState): Omit<PublicationCardProps, 'onPress'> {
  return {
    type: 'OFFER',
    title: offer.title,
    categoryName: offer.category?.name ?? 'Autre',
    locationLabel: offer.locationLabel || offer.location,
    createdAt: offer.createdAt,
    amount: offer.price,
    authorInitials: initials(offer.provider.fullName),
    authorName: offer.provider.fullName,
    status: offer.status,
    favorite: favoriteState?.favorite,
    favoritePending: favoriteState?.pending,
    onToggleFavorite: favoriteState?.onToggle,
  };
}

export function mapRequestToCard(request: RequestResponse, favoriteState?: FavoriteState): Omit<PublicationCardProps, 'onPress'> {
  return {
    type: 'REQUEST',
    title: request.title,
    categoryName: request.category?.name ?? 'Autre',
    locationLabel: request.locationLabel || request.location,
    createdAt: request.createdAt,
    amount: request.budget,
    authorInitials: initials(request.client.fullName),
    authorName: request.client.fullName,
    status: request.status,
    favorite: favoriteState?.favorite,
    favoritePending: favoriteState?.pending,
    onToggleFavorite: favoriteState?.onToggle,
  };
}
