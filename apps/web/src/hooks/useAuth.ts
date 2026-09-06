import { useMutation } from '@tanstack/react-query';
import type { LoginFormValues, RegisterFormValues } from '@prestalink/validation';
import { api } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

/**
 * Ce backend n'a pas de jeton de session : login renvoie l'utilisateur
 * directement. Le "token" que l'on retient cote client est simplement
 * `String(user.id)`, envoye ensuite en en-tete X-Current-User-Id
 * (voir packages/api-client/src/httpClient.ts) — livrable H.
 */
export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (values: LoginFormValues) => api.auth.login(values),
    onSuccess: (user) => setSession(user, String(user.id)),
  });
}

/**
 * `POST /api/auth/register` ignore encore le role (livrable H) : on enchaine
 * inscription -> connexion -> mise a jour du profil pour le fixer. La session
 * est etablie des la connexion (avant l'appel de mise a jour du role), sinon
 * ce dernier partirait sans X-Current-User-Id.
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
      const user = await api.auth.login({ email: values.email, password: values.password });
      setSession(user, String(user.id));
      // PUT /api/users/{id} ecrase tout le profil (pas de fusion partielle cote
      // backend) : il faut renvoyer l'utilisateur complet, sinon les champs
      // omis (dont l'email, non-nullable) sont ecrits a null et la sauvegarde
      // echoue (livrable H).
      return api.users.update(user.id, { ...user, role: values.role });
    },
    onSuccess: (withRole) => setSession(withRole, String(withRole.id)),
  });
}

/** Pas d'endpoint /api/auth/logout sur ce backend : rien a invalider cote serveur, on nettoie juste la session locale. */
export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  return useMutation({
    mutationFn: async () => clearSession(),
  });
}
