/**
 * FROGLYMPICS RESULTS
 * FROG enters placements per group; points count only after an admin verifies.
 * Placement points (set by a DB trigger): 1st 40 · 2nd 20 · 3rd 10 · 4th 5.
 *
 * Saving is split into insert / update(placement) / delete because clients only have
 * UPDATE on `placement` (0002_rls.sql), so a PostgREST upsert would be rejected.
 * Verified rows are locked by RLS, so they're read-only here too.
 * TODO:
 * - [x] Save into olympics_results { event_id, frog_group_id, placement } per group
 * - [x] Show existing results + "Pending admin verification" badge
 * - [ ] Admin view: "Verify" button -> supabase.rpc('verify_olympics_result', { p_result_id })
 * - [x] Prevent duplicate placements in the form
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useLeaderboard } from '../leaderboard/useLeaderboard';
import { useEvents } from '../events/useEvents';
import { formatDay } from '../events/eventPhase';

/** Display only; the real values live in private.set_olympics_points (0003_functions.sql). */
const PLACEMENT_POINTS = { 1: 40, 2: 20, 3: 10, 4: 5 };

/**
 * @typedef {object} OlympicsResult
 * @property {string} id
 * @property {string} frog_group_id
 * @property {number} placement
 * @property {number} points_awarded
 * @property {string | null} verified_at
 */

/**
 * FROG/admin screen for entering FROGlympics placements and seeing their verification status.
 * @returns {import('react').JSX.Element}
 */
export default function OlympicsResultPage() {
  const { events } = useEvents('all');
  const { rows: groups } = useLeaderboard();
  const olympics = useMemo(() => events.filter((e) => e.type === 'frogolympics'), [events]);
  const [eventId, setEventId] = useState('');
  /** @type {[Record<string, string>, Function]} */
  const [placements, setPlacements] = useState({});
  /** @type {[OlympicsResult[], Function]} */
  const [saved, setSaved] = useState([]);
  const [status, setStatus] = useState(
    /** @type {'loading' | 'editing' | 'saving' | 'saved'} */ ('editing'),
  );
  const [formError, setFormError] = useState('');
  const [version, setVersion] = useState(0);

  // Load whatever's already been entered for this event and prefill the form.
  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('olympics_results')
        .select('id, frog_group_id, placement, points_awarded, verified_at')
        .eq('event_id', eventId)
        .order('placement');
      if (cancelled) return;
      if (error) {
        setFormError(error.message);
        setStatus('editing');
        return;
      }
      const rows = data ?? [];
      setSaved(rows);
      setPlacements(Object.fromEntries(rows.map((r) => [r.frog_group_id, String(r.placement)])));
      setStatus(rows.length ? 'saved' : 'editing');
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, version]);

  const groupName = (id) => groups.find((g) => g.id === id)?.name ?? 'Group';
  const savedByGroup = Object.fromEntries(saved.map((r) => [r.frog_group_id, r]));
  const event = olympics.find((e) => e.id === eventId);
  const allVerified = saved.length > 0 && saved.every((r) => r.verified_at);

  /** @param {string} id */
  function chooseEvent(id) {
    setEventId(id);
    setPlacements({});
    setSaved([]);
    setFormError('');
    setStatus(id ? 'loading' : 'editing');
  }

  async function handleSubmit() {
    if (!eventId) return setFormError('Choose an event first.');
    const placed = groups.filter((g) => placements[g.id]).map((g) => Number(placements[g.id]));
    if (placed.length === 0) return setFormError('Give at least one group a placement.');
    if (new Set(placed).size !== placed.length)
      return setFormError('Two groups have the same placement.');

    setFormError('');
    setStatus('saving');

    const inserts = [];
    const ops = [];
    for (const g of groups) {
      const row = savedByGroup[g.id];
      const want = placements[g.id] ? Number(placements[g.id]) : null;
      if (row?.verified_at) continue; // locked once verified
      if (!row && want) inserts.push({ event_id: eventId, frog_group_id: g.id, placement: want });
      else if (row && want && row.placement !== want)
        ops.push(supabase.from('olympics_results').update({ placement: want }).eq('id', row.id));
      else if (row && !want) ops.push(supabase.from('olympics_results').delete().eq('id', row.id));
    }
    if (inserts.length) ops.push(supabase.from('olympics_results').insert(inserts));

    const results = await Promise.all(ops);
    const failed = results.find((r) => r.error);
    if (failed) setFormError(failed.error.message);
    setVersion((v) => v + 1); // reload from the DB either way
  }

  const locked = status !== 'editing';

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-extrabold text-frog-900">FROGlympics results</h1>
      <p className="text-sm text-neutral-500">
        Points count after an admin at the event verifies them.
      </p>

      <Card>
        <label className="block text-sm font-semibold">
          Event
          <select
            value={eventId}
            onChange={(e) => chooseEvent(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="">Choose a FROGlympics event…</option>
            {olympics.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({formatDay(e.starts_at)})
              </option>
            ))}
          </select>
        </label>

        <ul className="mt-4 space-y-2">
          {groups.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-3">
              <span className="font-medium">{g.name}</span>
              <select
                value={placements[g.id] ?? ''}
                disabled={locked || Boolean(savedByGroup[g.id]?.verified_at)}
                onChange={(e) => setPlacements({ ...placements, [g.id]: e.target.value })}
                className="rounded-lg border border-neutral-300 px-2 py-1 text-sm disabled:bg-neutral-100"
              >
                <option value="">Place</option>
                {[1, 2, 3, 4].map((p) => (
                  <option key={p} value={p}>
                    {p} (+{PLACEMENT_POINTS[p]})
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>

        {formError && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </p>
        )}
        <Button full className="mt-4" disabled={locked} onClick={handleSubmit}>
          {status === 'saving'
            ? 'Submitting…'
            : status === 'loading'
              ? 'Loading…'
              : 'Submit for verification'}
        </Button>
      </Card>

      {status === 'saved' && (
        <Card
          title="Results submitted"
          action={
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                allVerified ? 'bg-frog-100 text-frog-800' : 'bg-gold-400/20 text-neutral-700'
              }`}
            >
              {allVerified ? 'Verified' : 'Pending admin verification'}
            </span>
          }
        >
          <p className="mb-2 text-sm text-neutral-500">{event?.title}</p>
          <ul className="space-y-1">
            {saved.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  #{r.placement} {groupName(r.frog_group_id)}
                </span>
                <span className="flex items-center gap-2">
                  {r.verified_at && <span className="text-xs text-frog-700">✓ verified</span>}
                  <span className="font-semibold text-frog-700">+{r.points_awarded}</span>
                </span>
              </li>
            ))}
          </ul>
          {!allVerified && (
            <Button variant="secondary" full className="mt-4" onClick={() => setStatus('editing')}>
              Edit results
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
