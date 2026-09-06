import { useQuery } from '@tanstack/react-query';
import type { HomeBannerResponse } from '@prestalink/shared-types';
import { api } from '../services/apiClient';

/**
 * Contenu admin reel (table home_banners, deja gere via /api/admin/banners)
 * — `placeholderData` evite un flash de chargement sur l'ecran le plus vu du
 * site : le contenu s'affiche immediatement et se met a jour silencieusement
 * si l'admin l'a change depuis.
 */
const FALLBACK_BANNER: HomeBannerResponse = {
  id: 0,
  title: 'Services entre voisins, confiance au quotidien',
  subtitle:
    "La plateforme intelligente qui connecte rapidement les prestataires locaux avec les personnes qui ont besoin de leurs services, partout et à tout moment.",
  primaryButtonText: 'Publier une demande',
  primaryButtonLink: '/inscription',
  secondaryButtonText: 'Découvrir les offres',
  secondaryButtonLink: '/offres',
  imageUrl: '',
  feature1: 'Profils vérifiés',
  feature2: 'Communauté locale',
  feature3: 'Rapide & simple',
  feature4: 'Support réactif',
  isActive: true,
};

export function useHomeBanner() {
  return useQuery({
    queryKey: ['content', 'home-banner'],
    queryFn: () => api.content.activeBanner(),
    staleTime: 5 * 60_000,
    placeholderData: FALLBACK_BANNER,
  });
}
