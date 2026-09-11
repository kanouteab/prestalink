import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import type { PublicationCardProps } from '../../components';
import { initials } from '../../utils/format';
import { getLocale } from '../../i18n/localeStore';
import { fr } from '../../i18n/translations/fr';
import { en } from '../../i18n/translations/en';

const OTHER_LABEL = () => (getLocale() === 'en' ? en.common.other : fr.common.other);

type FavoriteState = { favorite: boolean; pending: boolean; onToggle: () => void };

export function mapOfferToCard(offer: OfferResponse, favoriteState?: FavoriteState): PublicationCardProps {
  return {
    type: 'OFFER',
    title: offer.title,
    categoryName: offer.category?.name ?? OTHER_LABEL(),
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

export function mapRequestToCard(request: RequestResponse, favoriteState?: FavoriteState): PublicationCardProps {
  return {
    type: 'REQUEST',
    title: request.title,
    categoryName: request.category?.name ?? OTHER_LABEL(),
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
