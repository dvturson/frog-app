import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Live group leaderboard. REFERENCE PATTERN for "query + realtime refresh":
 * load once, then re-load whenever a table that feeds the view changes.
 * @returns {{ rows: import('../../lib/types').LeaderboardRow[], loading: boolean, error: string | null }}
 */
export function useLeaderboard() {
  const [state, setState] = useState({ rows: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase.from('group_leaderboard').select('*').order('rank');
      if (!cancelled) setState({ rows: data ?? [], loading: false, error: error?.message ?? null });
    }
    load();

    const channel = supabase
      .channel(`leaderboard-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'olympics_results' }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return state;
}
