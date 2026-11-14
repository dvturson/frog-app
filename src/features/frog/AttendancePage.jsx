/**
 * FROG / ATTENDANCE: after the halfway point, mark who stayed.
 * Green check = stayed (+1 group point, XP, streak). Red X = left (no points).
 *
 * Currently MOCK STUDENTS. TODO:
 * - [ ] Load: supabase.from('checkins')
 *         .select('user_id, status, profile:profiles!checkins_user_id_fkey(display_name)')
 *         .eq('event_id', eventId)
 * - [ ] On tap: supabase.rpc('confirm_attendance', { p_event_id, p_user_id, p_stayed })
 *       (the function rejects a second confirmation, so add an "Are you sure?" step)
 * - [ ] Realtime on checkins so late scanners appear
 * - [ ] Summary: "N stayed → +N points for <group>"
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/Card';
import { useEvent } from '../events/useEvents';
import { eventPhase, formatTime } from '../events/eventPhase';

/** @type {{ user_id: string, display_name: string }[]} */
const MOCK_CHECKINS = [
  { user_id: 'a0000000-0000-0000-0000-000000000001', display_name: 'Maya Johnson' },
  { user_id: 'a0000000-0000-0000-0000-000000000002', display_name: 'Ethan Nguyen' },
  { user_id: 'a0000000-0000-0000-0000-000000000003', display_name: 'Olivia Martinez' },
];

export default function AttendancePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { event, loading } = useEvent(eventId);
  /** @type {[Record<string, 'stayed' | 'left'>, Function]} */
  const [marks, setMarks] = useState({});

  if (loading) return <p className="p-6 text-center text-sm text-neutral-500">Loading…</p>;

  const stayed = Object.values(marks).filter((m) => m === 'stayed').length;
  const over = event && eventPhase(event) === 'over';

  return (
    <div className="space-y-4 p-4">
      <button
        type="button"
        onClick={() => navigate('/frog')}
        className="text-sm font-semibold text-frog-700"
      >
        ← FROG Tools
      </button>
      <div>
        <h1 className="text-xl font-extrabold text-frog-900">Attendance</h1>
        {event && (
          <p className="text-sm text-neutral-500">
            {event.title} · ends {formatTime(event.ends_at)} {over && '(ended)'}
          </p>
        )}
      </div>

      <Card title={`Checked in (${MOCK_CHECKINS.length})`}>
        <p className="mb-3 text-xs text-neutral-500">
          Call out names. Tap ✓ if they stayed, ✗ if they left.
        </p>
        <ul className="divide-y divide-frog-100">
          {MOCK_CHECKINS.map((s) => (
            <li key={s.user_id} className="flex items-center justify-between py-2">
              <span className="font-medium">{s.display_name}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={`${s.display_name} stayed`}
                  onClick={() => setMarks({ ...marks, [s.user_id]: 'stayed' })}
                  className={`h-10 w-10 rounded-full text-lg font-bold ${
                    marks[s.user_id] === 'stayed'
                      ? 'bg-frog-600 text-white'
                      : 'bg-frog-50 text-frog-600'
                  }`}
                >
                  ✓
                </button>
                <button
                  type="button"
                  aria-label={`${s.display_name} left`}
                  onClick={() => setMarks({ ...marks, [s.user_id]: 'left' })}
                  className={`h-10 w-10 rounded-full text-lg font-bold ${
                    marks[s.user_id] === 'left' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'
                  }`}
                >
                  ✗
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <p className="rounded-xl bg-frog-50 p-3 text-center text-sm font-semibold text-frog-800">
        {stayed} stayed → +{stayed} points for your group
      </p>
    </div>
  );
}
