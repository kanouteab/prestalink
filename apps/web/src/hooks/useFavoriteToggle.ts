import { useNavigate } from 'react-router-dom';
import type { PublicationType } from '@prestalink/shared-types';
import { useIsFavorite, useToggleFavorite } from './useFavorites';
import { useIsAuthenticated } from '../store/authStore';

/** Bascule un favori, ou redirige vers la connexion si l'utilisateur est anonyme. */
export function useFavoriteToggle(type: PublicationType, id: number) {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const favorite = useIsFavorite(type, id);
  const toggle = useToggleFavorite();

  const onToggle = () => {
    if (!isAuthenticated) {
      navigate('/connexion');
      return;
    }
    toggle.mutate({ type, id, currentlyFavorite: favorite });
  };

  return { favorite, pending: toggle.isPending, onToggle };
}
