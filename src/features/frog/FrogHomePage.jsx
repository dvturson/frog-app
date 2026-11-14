/**
 * FROG / HOME (FROG Tools tab)
 * Group name, leaderboard, today's events (mandatory + up to 3 optional slots),
 * Add event, Chat, FROGlympics results. Tap an event to open its check-in QR.
 * TODO:
 * - [ ] Show how many students checked in per event
 * - [ ] Edit / delete your own optional events
 * - [ ] Post a quick reminder to the group chat from an event row
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LeaderboardList from '../leaderboard/LeaderboardList';
import { useLeaderboard } from '../leaderboard/useLeaderboard';
import EventList from '../events/EventList';
import { useEvents } from '../events/useEvents';
import { formatTime } from '../events/eventPhase';

export const MAX_OPTIONAL_EVENTS = 3;

/** @param {import('../../lib/types').LeapEvent} e */
const qrLink = (e) => `/frog/events/${e.id}/qr`;

export default function FrogHomePage() {
  const { profile } = useAuth();
  const { rows } = useLeaderboard();
  const { events, loading } = useEvents('today');

  const mandatory = events.filter((e) => e.is_mandatory);
  const optional = events.filter(
    (e) => !e.is_mandatory && e.frog_group_id === profile.frog_group_id,
  );
  const slots = Array.from({ length: MAX_OPTIONAL_EVENTS }, (_, i) => optional[i] ?? null);

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-frog-600">FROG Tools</p>
        <h1 className="text-2xl font-extrabold text-frog-900">
          {profile.frog_group?.name ?? 'Your group'}
        </h1>
      </div>

      <Card title="Leaderboard">
        <LeaderboardList rows={rows} highlightGroupId={profile.frog_group_id} />
      </Card>

      <Card title="Today's events">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : (
          <>
            <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-400">
              Mandatory
            </h3>
            <EventList events={mandatory} linkTo={qrLink} emptyText="No mandatory events today." />

            <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-neutral-400">
              Optional ({optional.length}/{MAX_OPTIONAL_EVENTS})
            </h3>
            <ul className="mt-2 space-y-2">
              {slots.map((e, i) =>
                e ? (
                  <li key={e.id}>
                    <Link
                      to={qrLink(e)}
                      className="block rounded-xl border border-frog-200 px-3 py-2 hover:bg-frog-50"
                    >
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-xs text-neutral-500">
                        {formatTime(e.starts_at)}–{formatTime(e.ends_at)} · {e.location_name}
                      </p>
                    </Link>
                  </li>
                ) : (
                  <li
                    key={`empty-${i}`}
                    className="rounded-xl border border-dashed border-neutral-300 px-3 py-3 text-sm text-neutral-400"
                  >
                    No optional event.
                  </li>
                ),
              )}
            </ul>
          </>
        )}
        <Button
          to="/frog/events/new"
          full
          className="mt-4"
          disabled={optional.length >= MAX_OPTIONAL_EVENTS}
        >
          Add event…
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" to="/chat">
          Group chat
        </Button>
        <Button variant="secondary" to="/frog/olympics">
          FROGlympics
        </Button>
      </div>
    </div>
  );
}
