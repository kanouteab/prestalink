import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '../store/authStore';

/** Protege /app/* : redirige vers /connexion en conservant la page visee pour y revenir apres connexion. */
export function RequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
