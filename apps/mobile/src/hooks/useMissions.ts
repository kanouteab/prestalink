import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { realtimeTopics } from '@prestalink/api-client';
import { api } from '../services/apiClient';
import { realtimeClient } from '../services/realtime';
import { useAuthStore } from '../store/authStore';

const MISSIONS_KEY = ['missions'];

export function useMissions() {
  return useQuery({ queryKey: MISSIONS_KEY, queryFn: () => api.missions.list() });
}

export function useMyMissions() {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useMissions();
  return {
    ...query,
    data: userId ? query.data?.filter((mission) => mission.client.id === userId || mission.provider.id === userId) : [],
  };
}

export function useMissionsRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    return realtimeClient.subscribe(realtimeTopics.missions(), () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_KEY });
    });
  }, [queryClient]);
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { clientId: number; providerId: number; requestId: number }) => api.missions.create(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useCancelMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.missions.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useFinishMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.missions.finish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MISSIONS_KEY }),
  });
}

export function useSubmitReview() {
  return useMutation({
    mutationFn: (params: { providerId: number; missionId: number; rating: number; comment?: string }) =>
      api.providers.createReview(params.providerId, params),
  });
}
