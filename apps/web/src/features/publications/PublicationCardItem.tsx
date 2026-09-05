import { useNavigate } from 'react-router-dom';
import type { OfferResponse, RequestResponse } from '@prestalink/shared-types';
import { PublicationCard } from '../../components';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import { mapOfferToCard, mapRequestToCard } from './mapToCard';

/** Carte d'offre connectee (favori + navigation vers le detail) — reutilisee par Home/Explorer/Offres/Favoris. */
export function OfferCardItem({ offer }: { offer: OfferResponse }) {
  const navigate = useNavigate();
  const favoriteState = useFavoriteToggle('OFFER', offer.id);
  return <PublicationCard {...mapOfferToCard(offer, favoriteState)} onClick={() => navigate(`/publication/OFFER/${offer.id}`)} />;
}

export function RequestCardItem({ request }: { request: RequestResponse }) {
  const navigate = useNavigate();
  const favoriteState = useFavoriteToggle('REQUEST', request.id);
  return <PublicationCard {...mapRequestToCard(request, favoriteState)} onClick={() => navigate(`/publication/REQUEST/${request.id}`)} />;
}
