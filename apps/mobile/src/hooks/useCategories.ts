import { useQuery } from '@tanstack/react-query';
import { api } from '../services/apiClient';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    staleTime: 5 * 60_000,
  });
}
