import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OfferInput } from '@prestalink/shared-types';
import { api } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

export function useOffersFeed(location?: string) {
  return useQuery({
    queryKey: ['offers', 'feed', location ?? null],
    queryFn: () => api.offers.feed(location),
  });
}

export function useOffer(id: number | undefined) {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: () => api.offers.get(id as number),
    enabled: id !== undefined,
  });
}

/** Pas d'endpoint "mes offres" cote backend (livrable H) : filtre client, comme sur le Web. */
export function useMyOffers() {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useOffersFeed();
  return {
    ...query,
    data: userId ? query.data?.filter((offer) => offer.provider.id === userId) : [],
  };
}

/** `providerId` est obligatoire cote backend (livrable H) : toujours l'utilisateur courant, jamais deduit d'un jeton. */
export function useCreateOffer() {
  const queryClient = useQueryClient();
  const providerId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (input: OfferInput) => api.offers.create(input, providerId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.offers.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  });
}
