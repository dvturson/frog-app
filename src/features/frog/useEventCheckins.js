import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * @typedef {import('../../lib/types').Checkin & { profile: { display_name: string } | null }} CheckinWithProfile
 */

/**
 * Live check-ins for one event, oldest scan first. RLS limits a FROG to their own
 * group's students. Re-loads whenever a row for this event is inserted or updated
 * (same pattern as useLeaderboard), or when `reload()` is called.
 * @param {string | undefined} eventId
 * @returns {{ checkins: CheckinWithProfile[], loading: boolean, error: string | null, reload: () => void }}
 */
export function useEventCheckins(eventId) {
  const [state, setState] = useState({ checkins: [], loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    async function load() {
      // FK hint: checkins points at profiles twice (user_id and confirmed_by).
      const { data, error } = await supabase
        .from('checkins')
        .select('*, profile:profiles!checkins_user_id_fkey(display_name)')
        .eq('event_id', eventId)
        .order('created_at');
      if (!cancelled)
        setState({ checkins: data ?? [], loading: false, error: error?.message ?? null });
    }
    load();

    const channel = supabase
      .channel(`checkins-${eventId}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins', filter: `event_id=eq.${eventId}` },
        load,
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [eventId, version]);

  return { ...state, reload: () => setVersion((v) => v + 1) };
}
