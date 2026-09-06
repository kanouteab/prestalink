import { useMutation } from '@tanstack/react-query';
import type { UserResponse } from '@prestalink/shared-types';
import { api } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation({
    mutationFn: (payload: Partial<UserResponse>) => {
      const userId = useAuthStore.getState().user!.id;
      return api.users.update(userId, payload);
    },
    onSuccess: (user) => updateUser(user),
  });
}

export function useUploadProfilePhoto() {
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation({
    mutationFn: (file: File) => api.users.uploadPhoto(file),
    onSuccess: (user) => updateUser(user),
  });
}
