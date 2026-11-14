/**
 * PROFILE TAB
 * TODO:
 * - [ ] Edit display name + major (only those columns are writable; see 0002_rls.sql)
 * - [ ] Attendance history (checkins joined to events)
 * - [ ] Badges for comfort-zone milestones
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { levelFromXp, liveStreak } from '../../lib/points';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FrogMascot from '../../components/FrogMascot';

const ROLE_LABEL = { freshman: 'Freshman', frog: 'FROG', admin: 'Admin' };

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
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
        <p className="text-sm text-neutral-500">TODO: list of events you checked in to.</p>
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
