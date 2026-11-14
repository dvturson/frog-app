import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

const HISTORY_LIMIT = 1000;

/**
 * Short time label: clock time for today, weekday + time for older messages.
 * @param {string} iso ISO timestamp
 * @returns {string}
 */
function formatTime(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toDateString() === new Date().toDateString()
    ? time
    : `${d.toLocaleDateString([], { weekday: 'short' })} ${time}`;
}

/**
 * Persistent group chat backed by the `messages` table.
 * Loads full history on mount (so users see old messages after logging back in),
 * appends new rows live via Realtime, and re-syncs when the tab regains focus.
 * RLS already limits rows to the user's group and their own DMs.
 *
 * Thread keys: 'announcements' | 'group' | 'frog' (student's DM with their FROG)
 *              | 'dm:<studentId>' (FROG's DM with one student).
 *
 * @param {import('../../lib/types').Profile} profile
 * @returns {{
 *   members: { id: string, display_name: string }[],
 *   threads: Record<string, { id: number, author: string, mine: boolean, body: string, time: string }[]>,
 *   loading: boolean,
 *   error: string | null,
 *   send: (channelKey: string, body: string) => Promise<boolean>,
 * }}
 */
export function useChat(profile) {
  const groupId = profile.frog_group_id;
  const myId = profile.id;
  const isFrog = profile.role === 'frog';

  const [people, setPeople] = useState(
    /** @type {{ id: string, display_name: string, role: string | null }[]} */ ([]),
  );
  const [rows, setRows] = useState(/** @type {import('../../lib/types').Message[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  /** Merge rows by id so history reloads and realtime inserts never duplicate. */
  const mergeRows = useCallback((incoming) => {
    setRows((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      return [...byId.values()].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at) || a.id - b.id,
      );
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!groupId) return;
    // Newest N, then flipped to chronological order by mergeRows.
    const { data, error: err } = await supabase
      .from('messages')
      .select('*')
      .eq('frog_group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT);
    if (err) {
      console.error('[chat] could not load messages', err);
      setError('Could not load messages.');
      return;
    }
    setError(null);
    mergeRows(data ?? []);
  }, [groupId, mergeRows]);

  // Initial load: group roster (for names + DM targets) and message history.
  useEffect(() => {
    if (!groupId) return undefined;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .eq('frog_group_id', groupId)
        .order('display_name');
      if (cancelled) return;
      if (err) console.error('[chat] could not load group members', err);
      setPeople(data ?? []);
      await loadMessages();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId, loadMessages]);

  // Realtime inserts + re-sync when the app comes back to the foreground.
  useEffect(() => {
    if (!groupId) return undefined;

    const channel = supabase
      .channel(`chat-${groupId}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `frog_group_id=eq.${groupId}`,
        },
        (payload) => mergeRows([payload.new]),
      )
      .subscribe((status) => {
        // After a dropped connection comes back, pull anything we missed.
        if (status === 'SUBSCRIBED') loadMessages();
      });

    function onVisible() {
      if (document.visibilityState === 'visible') loadMessages();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [groupId, loadMessages, mergeRows]);

  const members = useMemo(() => people.filter((p) => p.role === 'freshman'), [people]);
  const frogId = useMemo(() => people.find((p) => p.role === 'frog')?.id ?? null, [people]);

  const threads = useMemo(() => {
    const names = new Map(people.map((p) => [p.id, p.display_name]));
    const out = /** @type {Record<string, any[]>} */ ({});
    for (const m of rows) {
      let key;
      if (m.channel === 'dm') {
        const other = m.user_id === myId ? m.recipient_id : m.user_id;
        key = isFrog ? `dm:${other}` : 'frog';
      } else {
        key = m.channel;
      }
      const mine = m.user_id === myId;
      const name = names.get(m.user_id) ?? 'Member';
      (out[key] ??= []).push({
        id: m.id,
        author: mine ? 'You' : name,
        mine,
        body: m.body,
        time: formatTime(m.created_at),
      });
    }
    return out;
  }, [rows, people, myId, isFrog]);

  /**
   * Insert a message. user_id is filled in by the DB (default auth.uid()).
   * @param {string} channelKey
   * @param {string} body
   * @returns {Promise<boolean>} true if saved
   */
  const send = useCallback(
    async (channelKey, body) => {
      const text = body.trim();
      if (!text || !groupId) return false;

      /** @type {{ frog_group_id: string, channel: string, recipient_id: string | null, body: string }} */
      let row = { frog_group_id: groupId, channel: channelKey, recipient_id: null, body: text };
      if (channelKey === 'frog') {
        if (!frogId) {
          setError('Your FROG is not set up yet.');
          return false;
        }
        row = { ...row, channel: 'dm', recipient_id: frogId };
      } else if (channelKey.startsWith('dm:')) {
        row = { ...row, channel: 'dm', recipient_id: channelKey.slice(3) };
      }

      const { data, error: err } = await supabase.from('messages').insert(row).select().single();
      if (err) {
        console.error('[chat] send failed', err);
        setError('Message failed to send. Try again.');
        return false;
      }
      setError(null);
      mergeRows([data]);
      return true;
    },
    [groupId, frogId, mergeRows],
  );

  // No group (e.g. admin) means nothing to load.
  return { members, threads, loading: loading && Boolean(groupId), error, send };
}
