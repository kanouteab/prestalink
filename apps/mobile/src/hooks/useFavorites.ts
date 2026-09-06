import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublicationType } from '@prestalink/shared-types';
import { api } from '../services/apiClient';
import { useIsAuthenticated } from '../store/authStore';

export function useFavorites() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['favorites', 'mine'],
    queryFn: () => api.favorites.mine(),
    enabled: isAuthenticated,
  });
}

export function useIsFavorite(type: PublicationType, id: number): boolean {
  const { data } = useFavorites();
  return Boolean(data?.some((favorite) => favorite.publicationType === type && favorite.publicationId === id));
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, id, currentlyFavorite }: { type: PublicationType; id: number; currentlyFavorite: boolean }) => {
      if (currentlyFavorite) return api.favorites.remove(type, id);
      return api.favorites.add(type, id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
