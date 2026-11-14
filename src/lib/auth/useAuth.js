import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Access the session, profile and auth actions.
 * @returns {import('./AuthContext').AuthValue}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Roles allowed to use the app. Anyone else gets the "Sorry" message. */
export const APP_ROLES = ['freshman', 'frog', 'admin'];
