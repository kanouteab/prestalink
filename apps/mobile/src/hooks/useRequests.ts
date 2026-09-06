import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RequestInput } from '@prestalink/shared-types';
import { api } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

export function useRequestsList(params?: { providerId?: number; location?: string }) {
  return useQuery({
    queryKey: ['requests', 'list', params ?? null],
    queryFn: () => api.requests.list(params),
  });
}

export function useRequest(id: number | undefined) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () => api.requests.get(id as number),
    enabled: id !== undefined,
  });
}

export function useMyRequests() {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useRequestsList();
  return {
    ...query,
    data: userId ? query.data?.filter((request) => request.client.id === userId) : [],
  };
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RequestInput) => api.requests.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.requests.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });
}
