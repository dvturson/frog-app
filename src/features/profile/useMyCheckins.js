import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * @typedef {import('../../lib/types').Checkin & {
 *   event: { title: string, starts_at: string, location_name: string | null, xp: number } | null
 * }} CheckinWithEvent
 */

/**
 * The signed-in user's check-ins joined to their events, newest first.
 * Re-loads live when one of their rows is inserted (scan) or updated (FROG confirms).
 * @param {string | undefined} userId
 * @returns {{ checkins: CheckinWithEvent[], loading: boolean, error: string | null }}
 */
export function useMyCheckins(userId) {
  const [state, setState] = useState({ checkins: [], loading: true, error: null });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from('checkins')
        .select('*, event:events(title, starts_at, location_name, xp)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!cancelled)
        setState({ checkins: data ?? [], loading: false, error: error?.message ?? null });
    }
    load();

    const channel = supabase
      .channel(`my-checkins-${userId}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins', filter: `user_id=eq.${userId}` },
        load,
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return state;
}
