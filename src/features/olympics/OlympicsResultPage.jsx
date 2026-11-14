/**
 * FROGLYMPICS RESULTS
 * FROG enters placements per group; points count only after an admin verifies.
 * Placement points (set by a DB trigger): 1st 40 · 2nd 20 · 3rd 10 · 4th 5.
 *
 * DEMO: "Submit" validates and shows a local "Pending admin verification" summary;
 * nothing is written to the database yet. TODO:
 * - [ ] Save: upsert into olympics_results { event_id, frog_group_id, placement } per group
 * - [ ] Show existing results + "Pending admin verification" badge
 * - [ ] Admin view: "Verify" button -> supabase.rpc('verify_olympics_result', { p_result_id })
 * - [x] Prevent duplicate placements in the form
 */
import { useMemo, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useLeaderboard } from '../leaderboard/useLeaderboard';
import { useEvents } from '../events/useEvents';
import { formatDay } from '../events/eventPhase';

/** Display only; the real values live in private.set_olympics_points (0003_functions.sql). */
const PLACEMENT_POINTS = { 1: 40, 2: 20, 3: 10, 4: 5 };

/**
 * FROG/admin screen for entering FROGlympics placements (demo submit, see header).
 * @returns {import('react').JSX.Element}
 */
export default function OlympicsResultPage() {
  const { events } = useEvents('all');
  const { rows: groups } = useLeaderboard();
  const olympics = useMemo(() => events.filter((e) => e.type === 'frogolympics'), [events]);
  const [eventId, setEventId] = useState('');
  /** @type {[Record<string, string>, Function]} */
  const [placements, setPlacements] = useState({});
  const [status, setStatus] = useState(
    /** @type {'editing' | 'submitting' | 'submitted'} */ ('editing'),
  );
  const [formError, setFormError] = useState('');

  const placed = groups
    .filter((g) => placements[g.id])
    .map((g) => ({ ...g, place: Number(placements[g.id]) }))
    .sort((a, b) => a.place - b.place);
  const event = olympics.find((e) => e.id === eventId);

  function handleSubmit() {
    if (!eventId) return setFormError('Choose an event first.');
    if (placed.length === 0) return setFormError('Give at least one group a placement.');
    const places = placed.map((g) => g.place);
    if (new Set(places).size !== places.length)
      return setFormError('Two groups have the same placement.');
    setFormError('');
    setStatus('submitting');
    // Demo only: pretend to save. The real version upserts into olympics_results.
    setTimeout(() => setStatus('submitted'), 600);
  }

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
            onChange={(e) => setEventId(e.target.value)}
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
                onChange={(e) => setPlacements({ ...placements, [g.id]: e.target.value })}
                className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
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
        <Button full className="mt-4" disabled={status !== 'editing'} onClick={handleSubmit}>
          {status === 'submitting' ? 'Submitting…' : 'Submit for verification'}
        </Button>
      </Card>

      {status === 'submitted' && (
        <Card
          title="Results submitted"
          action={
            <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-semibold text-neutral-700">
              Pending admin verification
            </span>
          }
        >
          <p className="mb-2 text-sm text-neutral-500">{event?.title}</p>
          <ul className="space-y-1">
            {placed.map((g) => (
              <li key={g.id} className="flex justify-between text-sm">
                <span>
                  #{g.place} {g.name}
                </span>
                <span className="font-semibold text-frog-700">+{PLACEMENT_POINTS[g.place]}</span>
              </li>
            ))}
          </ul>
          <Button variant="secondary" full className="mt-4" onClick={() => setStatus('editing')}>
            Edit results
          </Button>
        </Card>
      )}
    </div>
  );
}
