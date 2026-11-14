import { Navigate } from 'react-router-dom';
import { useAuth, APP_ROLES } from './useAuth';

/**
 * Route guard. Not signed in -> /login. Wrong role -> home.
 * @param {{ roles?: import('../types').UserRole[], children: import('react').ReactNode }} props
 *   roles: who may see this route (defaults to every app role)
 */
export default function RequireRole({ roles = APP_ROLES, children }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <p className="p-6 text-center text-sm text-neutral-500">Loading…</p>;
  }
  if (!session || !profile) return <Navigate to="/login" replace />;
  if (!roles.includes(profile.role)) return <Navigate to="/" replace />;
  return children;
}
