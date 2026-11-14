/**
 * PATH (home tab)
 * Logged out: logo + Login button.
 * Logged in:  dashboard = mini leaderboard, chat + scan shortcuts, today's FROG
 *             events (with Today / All days toggle), next 3 BeInvolved events.
 * TODO:
 * - [ ] "Your next event" hero card with countdown
 * - [ ] Daily comfort-zone challenge / tip from the mascot
 * - [ ] Celebrate streak milestones (FrogMascot mood="cheer")
 */
import { useState } from 'react';
import { useAuth, APP_ROLES } from '../../lib/auth/useAuth';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FrogMascot from '../../components/FrogMascot';
import LeaderboardList from '../leaderboard/LeaderboardList';
import { useLeaderboard } from '../leaderboard/useLeaderboard';
import DayToggle from '../events/DayToggle';
import EventList from '../events/EventList';
import BeInvolvedList from '../events/BeInvolvedList';
import { useEvents } from '../events/useEvents';

/** Logo lockup used on the logged-out screen. Designer: swap freely. */
function Logo() {
  return (
    <div className="flex flex-col items-center text-center">
      <FrogMascot mood="wave" size={160} />
      <h1 className="mt-2 text-4xl font-black tracking-tight text-frog-700">
        JMU <span className="text-frog-500">LEAP</span>
      </h1>
      <p className="mt-1 text-sm font-medium text-neutral-500">Break out of your comfort zone.</p>
    </div>
  );
}

function LoggedOut() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-gradient-to-b from-white to-frog-50 px-6">
      <Logo />
      <Button to="/login" full className="max-w-xs text-base">
        Log in
      </Button>
    </div>
  );
}

function Dashboard() {
  const { profile } = useAuth();
  const [range, setRange] = useState(/** @type {'today' | 'all'} */ ('today'));
  const { rows } = useLeaderboard();
  const { events, loading } = useEvents(range);
  const isFrog = profile.role === 'frog';

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <FrogMascot mood="happy" size={56} />
        <div>
          <p className="text-lg font-bold text-frog-900">
            Hi, {profile.display_name.split(' ')[0]}!
          </p>
          <p className="text-sm text-neutral-500">{profile.frog_group?.name ?? 'No group yet'}</p>
        </div>
      </div>

      <Card
        title="FROG Leaderboard"
        action={
          <Button variant="ghost" to="/leaderboard" className="!px-2 !py-1">
            See all
          </Button>
        }
      >
        <LeaderboardList rows={rows} highlightGroupId={profile.frog_group_id} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" to="/chat">
          Group chat
        </Button>
        {isFrog ? <Button to="/frog">FROG Tools</Button> : <Button to="/scan">Scan QR</Button>}
      </div>

      <Card title="FROG events" action={<DayToggle value={range} onChange={setRange} />}>
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : (
          <EventList events={events} showDay={range === 'all'} emptyText="No FROG events today." />
        )}
      </Card>

      <Card title="More Weeks of Welcome">
        <BeInvolvedList />
      </Card>
    </div>
  );
}

export default function PathPage() {
  const { profile, loading } = useAuth();
  if (loading) return <p className="p-6 text-center text-sm text-neutral-500">Loading…</p>;
  const signedIn = profile && APP_ROLES.includes(profile.role);
  return signedIn ? <Dashboard /> : <LoggedOut />;
}
