import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { AuthContext } from './AuthContext';

/**
 * Load a profile plus its group name.
 * The FK hint is needed because frog_groups also points back at profiles.
 * @param {string} userId
 * @returns {Promise<import('../types').Profile | null>}
 */
async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, frog_group:frog_groups!profiles_frog_group_id_fkey(id, name)')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('[auth] could not load profile', error);
    return null;
  }
  return data;
}

/**
 * Holds the Supabase session + the signed-in user's profile for the whole app.
 * @param {{ children: import('react').ReactNode }} props
 */
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) setProfile(await fetchProfile(data.session.user.id));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const p = await fetchProfile(data.user.id);
    setProfile(p);
    return p;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session) setProfile(await fetchProfile(session.user.id));
  }, [session]);

  const value = useMemo(
    () => ({ session, profile, loading, signIn, signOut, refreshProfile }),
    [session, profile, loading, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
