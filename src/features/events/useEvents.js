import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Events the current user can see (RLS hides other groups' optional events).
 * @param {'today' | 'all'} range
 * @returns {{ events: import('../../lib/types').LeapEvent[], loading: boolean, error: string | null, reload: () => void }}
 */
export function useEvents(range = 'today') {
  const [state, setState] = useState({ events: [], loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let query = supabase.from('events').select('*').order('starts_at');
    if (range === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query = query.gte('starts_at', start.toISOString()).lt('starts_at', end.toISOString());
    }
    query.then(({ data, error }) => {
      if (!cancelled)
        setState({ events: data ?? [], loading: false, error: error?.message ?? null });
    });
    return () => {
      cancelled = true;
    };
  }, [range, version]);

  return { ...state, reload: () => setVersion((v) => v + 1) };
}

/**
 * One event by id.
 * @param {string | undefined} eventId
 * @returns {{ event: import('../../lib/types').LeapEvent | null, loading: boolean, error: string | null }}
 */
export function useEvent(eventId) {
  const [state, setState] = useState({ event: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
      .then(({ data, error }) => {
        if (!cancelled) setState({ event: data, loading: false, error: error?.message ?? null });
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return state;
}
