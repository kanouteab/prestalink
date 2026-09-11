import { useQuery } from '@tanstack/react-query';
import type { HomeBannerResponse } from '@prestalink/shared-types';
import { api } from '../services/apiClient';
import { useTranslation } from '../i18n/useTranslation';

/**
 * Contenu admin reel (table home_banners, deja gere via /api/admin/banners)
 * — `placeholderData` evite un flash de chargement sur l'ecran le plus vu du
 * site : le contenu s'affiche immediatement et se met a jour silencieusement
 * si l'admin l'a change depuis. Note : une fois charge depuis l'admin, ce
 * contenu reste dans la langue ou il a ete saisi en base — seul ce repli
 * (avant reponse serveur) suit la langue choisie dans l'interface.
 */
export function useHomeBanner() {
  const { t } = useTranslation();
  const fallbackBanner: HomeBannerResponse = {
    id: 0,
    title: t('heroBanner.fallbackTitle'),
    subtitle: t('heroBanner.fallbackSubtitle'),
    primaryButtonText: t('heroBanner.fallbackPrimaryButton'),
    primaryButtonLink: '/inscription',
    secondaryButtonText: t('heroBanner.fallbackSecondaryButton'),
    secondaryButtonLink: '/offres',
    imageUrl: '',
    feature1: t('heroBanner.fallbackFeature1'),
    feature2: t('heroBanner.fallbackFeature2'),
    feature3: t('heroBanner.fallbackFeature3'),
    feature4: t('heroBanner.fallbackFeature4'),
    isActive: true,
  };

  return useQuery({
    queryKey: ['content', 'home-banner'],
    queryFn: () => api.content.activeBanner(),
    staleTime: 5 * 60_000,
    placeholderData: fallbackBanner,
  });
}
