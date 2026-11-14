import { createContext } from 'react';

/**
 * @typedef {object} AuthValue
 * @property {import('@supabase/supabase-js').Session | null} session
 * @property {import('../types').Profile | null} profile
 * @property {boolean} loading                True until the first session/profile load finishes
 * @property {(email: string, password: string) => Promise<import('../types').Profile>} signIn
 * @property {() => Promise<void>} signOut
 * @property {() => Promise<void>} refreshProfile
 */

/** @type {import('react').Context<AuthValue | null>} */
export const AuthContext = createContext(null);
