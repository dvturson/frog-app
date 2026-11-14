/**
 * FROG / ATTENDANCE: after the halfway point, mark who stayed.
 * Green check = stayed (+1 group point, XP, streak). Red X = left (no points).
 *
 * Flow: tap ✓ / ✗ to mark students (tap again to unmark), then "Save" opens a
 * confirm sheet, because confirm_attendance can't be undone. The list updates live
 * as late students scan (useEventCheckins subscribes to checkins).
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Sheet from '../../components/Sheet';
import { useAuth } from '../../lib/auth/useAuth';
import { supabase } from '../../lib/supabase';
import { useEvent } from '../events/useEvents';
import { eventPhase, formatTime } from '../events/eventPhase';
import { useEventCheckins } from './useEventCheckins';

/** @typedef {'stayed' | 'left'} Mark */

/**
 * Attendance screen for one event (`/frog/events/:eventId/attendance`).
 * @returns {import('react').ReactElement}
 */
export default function AttendancePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { event, loading } = useEvent(eventId);
  const {
    checkins,
    loading: checkinsLoading,
    error: loadError,
    reload,
  } = useEventCheckins(eventId);
  /** @type {[Record<string, Mark>, Function]} */
  const [marks, setMarks] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  /** @type {[string | null, Function]} */
  const [saveError, setSaveError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // Re-check the phase so the buttons unlock at the halfway point without a refresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  if (loading) return <p className="p-6 text-center text-sm text-neutral-500">Loading…</p>;

  const phase = event ? eventPhase(event, now) : null;
  const canConfirm = phase === 'attendance' || phase === 'over';
  const halfway =
    event &&
    new Date(
      (new Date(event.starts_at).getTime() + new Date(event.ends_at).getTime()) / 2,
    ).toISOString();

  const pending = checkins.filter((c) => c.status === 'arrived');
  const done = checkins.filter((c) => c.status !== 'arrived');
  const markedIds = Object.keys(marks).filter((id) => pending.some((c) => c.user_id === id));
  const markedStayed = markedIds.filter((id) => marks[id] === 'stayed').length;
  const markedLeft = markedIds.length - markedStayed;
  const confirmedStayed = done.filter((c) => c.status === 'stayed').length;
  const pointsEarned = done.reduce((sum, c) => sum + c.points_awarded, 0);
  const groupName = profile?.frog_group?.name ?? 'your group';

  /**
   * Toggle a student's mark; tapping the same mark again clears it.
   * @param {string} userId
   * @param {Mark} mark
   */
  function toggle(userId, mark) {
    setMarks((m) => {
      const next = { ...m };
      if (next[userId] === mark) delete next[userId];
      else next[userId] = mark;
      return next;
    });
  }

  /** Send every pending mark through confirm_attendance, one student at a time. */
  async function save() {
    setSaving(true);
    setSaveError(null);
    const failed = [];
    for (const userId of markedIds) {
      const { error } = await supabase.rpc('confirm_attendance', {
        p_event_id: eventId,
        p_user_id: userId,
        p_stayed: marks[userId] === 'stayed',
      });
      if (error) {
        const name = checkins.find((c) => c.user_id === userId)?.profile?.display_name;
        failed.push(`${name ?? 'Student'}: ${error.message}`);
      }
    }
    setMarks({});
    setSaving(false);
    setConfirmOpen(false);
    if (failed.length) setSaveError(failed.join('\n'));
    reload();
  }

  return (
    <div className="space-y-4 p-4 pb-28">
      <button
        type="button"
        onClick={() => navigate('/frog')}
        className="text-base font-semibold text-frog-700"
      >
        ← FROG Tools
      </button>
      <div>
        <h1 className="text-xl font-extrabold text-frog-900">Attendance</h1>
        {event && (
          <p className="text-sm text-neutral-500">
            {event.title} · ends {formatTime(event.ends_at)} {phase === 'over' && '(ended)'}
          </p>
        )}
      </div>

      {event && !canConfirm && (
        <p className="rounded-xl bg-gold-400/20 p-3 text-sm font-medium text-frog-900">
          Attendance opens at {formatTime(halfway)} (halfway through). Students can still scan in
          until then.
        </p>
      )}

      {(loadError || saveError) && (
        <p className="whitespace-pre-line rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {loadError ?? saveError}
        </p>
      )}

      <Card
        title={`Waiting on you (${pending.length})`}
        action={
          <span className="flex items-center gap-1 text-xs font-semibold text-frog-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-frog-500" /> Live
          </span>
        }
      >
        {checkinsLoading ? (
          <p className="text-sm text-neutral-500">Loading check-ins…</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {checkins.length === 0
              ? 'No one has scanned in yet. Names show up here as students scan.'
              : 'Everyone is confirmed. Nice work!'}
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-neutral-500">
              Call out names. Tap ✓ if they stayed, ✗ if they left.
            </p>
            <ul className="divide-y divide-frog-100">
              {pending.map((c) => {
                const name = c.profile?.display_name ?? 'Student';
                return (
                  <li key={c.user_id} className="flex items-center justify-between py-2">
                    <span className="font-medium">{name}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!canConfirm}
                        aria-label={`${name} stayed`}
                        aria-pressed={marks[c.user_id] === 'stayed'}
                        onClick={() => toggle(c.user_id, 'stayed')}
                        className={`h-10 w-10 rounded-full text-lg font-bold disabled:opacity-40 ${
                          marks[c.user_id] === 'stayed'
                            ? 'bg-frog-600 text-white'
                            : 'bg-frog-50 text-frog-600'
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        disabled={!canConfirm}
                        aria-label={`${name} left`}
                        aria-pressed={marks[c.user_id] === 'left'}
                        onClick={() => toggle(c.user_id, 'left')}
                        className={`h-10 w-10 rounded-full text-lg font-bold disabled:opacity-40 ${
                          marks[c.user_id] === 'left'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        ✗
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      {done.length > 0 && (
        <Card title={`Confirmed (${done.length})`}>
          <ul className="divide-y divide-frog-100">
            {done.map((c) => (
              <li key={c.user_id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium">{c.profile?.display_name ?? 'Student'}</span>
                {c.status === 'stayed' ? (
                  <span className="rounded-full bg-frog-100 px-2 py-0.5 text-xs font-semibold text-frog-800">
                    Stayed · +{c.points_awarded}
                  </span>
                ) : (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                    Left
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="rounded-xl bg-frog-50 p-3 text-center text-sm font-semibold text-frog-800">
        {confirmedStayed} stayed → +{pointsEarned} {pointsEarned === 1 ? 'point' : 'points'} for{' '}
        {groupName}
      </p>

      {markedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30 mx-auto w-full max-w-[390px] px-4">
          <Button full onClick={() => setConfirmOpen(true)} className="shadow-lg">
            Save {markedIds.length} {markedIds.length === 1 ? 'student' : 'students'}
          </Button>
        </div>
      )}

      <Sheet
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        title="Are you sure?"
      >
        <p className="text-sm text-neutral-600">
          <strong className="text-frog-800">{markedStayed} stayed</strong> (+1 point each, plus any
          streak bonus) and <strong className="text-red-700">{markedLeft} left</strong>. This
          can&apos;t be undone.
        </p>
        <ul className="my-3 max-h-48 space-y-1 overflow-y-auto text-sm">
          {markedIds.map((id) => (
            <li key={id} className="flex justify-between">
              <span>{checkins.find((c) => c.user_id === id)?.profile?.display_name}</span>
              <span className={marks[id] === 'stayed' ? 'text-frog-700' : 'text-red-600'}>
                {marks[id] === 'stayed' ? '✓ Stayed' : '✗ Left'}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button variant="secondary" full disabled={saving} onClick={() => setConfirmOpen(false)}>
            Back
          </Button>
          <Button full disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Confirm'}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
