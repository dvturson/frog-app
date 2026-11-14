/**
 * PROFILE TAB
 * TODO:
 * - [ ] Edit display name + major (only those columns are writable; see 0002_rls.sql)
 * - [x] Attendance history (checkins joined to events, live via realtime)
 * - [ ] Badges for comfort-zone milestones
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { levelFromXp, liveStreak } from '../../lib/points';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FrogMascot from '../../components/FrogMascot';
import { formatDay, formatTime } from '../events/eventPhase';
import { useMyCheckins } from './useMyCheckins';

const ROLE_LABEL = { freshman: 'Freshman', frog: 'FROG', admin: 'Admin' };

/** Badge text + colors for each check-in status. */
const STATUS = {
  arrived: { label: 'Awaiting FROG', className: 'bg-gold-400/20 text-neutral-700' },
  stayed: { label: 'Confirmed', className: 'bg-frog-100 text-frog-800' },
  left: { label: 'Left early', className: 'bg-red-50 text-red-700' },
};

/**
 * Profile tab: stats, live attendance history, sign out.
 * @returns {import('react').JSX.Element}
 */
export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { checkins, loading, error } = useMyCheckins(profile.id);
  const navigate = useNavigate();
  const { level } = levelFromXp(profile.xp);

  const stats = [
    { label: 'Level', value: level },
    { label: 'XP', value: profile.xp },
    { label: 'Day streak', value: liveStreak(profile.current_streak, profile.last_active_date) },
    { label: 'Group points earned', value: profile.points },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col items-center text-center">
        <FrogMascot mood="wave" size={96} />
        <h1 className="mt-2 text-2xl font-extrabold text-frog-900">{profile.display_name}</h1>
        <p className="text-sm text-neutral-500">
          {ROLE_LABEL[profile.role]} · {profile.frog_group?.name ?? 'No group'}
          {profile.major ? ` · ${profile.major}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-frog-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-frog-700">{s.value}</p>
            <p className="text-xs font-medium text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      <Card title="Attendance history">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : checkins.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No check-ins yet. Scan your FROG&apos;s QR at an event to start your history.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {checkins.map((c) => {
              const s = STATUS[c.status];
              return (
                <li key={c.event_id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.event?.title ?? 'Event'}</p>
                    <p className="text-xs text-neutral-500">
                      {c.event
                        ? `${formatDay(c.event.starts_at)} · ${formatTime(c.event.starts_at)}`
                        : ''}
                      {c.status === 'stayed' && c.event ? ` · +${c.event.xp} XP` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${s.className}`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {profile.role === 'admin' && (
        <Button variant="secondary" to="/admin" full>
          Admin tools
        </Button>
      )}
      <Button
        variant="ghost"
        full
        onClick={async () => {
          await signOut();
          navigate('/', { replace: true });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
