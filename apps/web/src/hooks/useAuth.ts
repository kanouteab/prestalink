import { useMutation } from '@tanstack/react-query';
import type { LoginFormValues, RegisterFormValues } from '@prestalink/validation';
import { api } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (values: LoginFormValues) => api.auth.login(values),
    onSuccess: ({ user, token }) => setSession(user, token),
  });
}

/**
 * `POST /api/auth/register` ignore encore le role (livrable H) : on enchaine
 * inscription -> connexion -> mise a jour du profil pour le fixer, en un seul
 * flux cote client plutot que de laisser chaque ecran le reimplementer.
 */
export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await api.auth.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        country: values.country,
        streetAddress: values.streetAddress,
        postalCode: values.postalCode,
        role: values.role,
      });
      const { user, token } = await api.auth.login({ email: values.email, password: values.password });
      const withRole = await api.users.update(user.id, { role: values.role });
      return { user: withRole, token };
    },
    onSuccess: ({ user, token }) => setSession(user, token),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => clearSession(),
  });
}
