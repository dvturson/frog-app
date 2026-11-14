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
import { useEffect, useState } from 'react';
import { useAuth, APP_ROLES } from '../../lib/auth/useAuth';
import Button from '../../components/Button';
import ChatBubbleIcon from '../../components/ChatBubbleIcon';
import Card from '../../components/Card';
import FrogMascot from '../../components/FrogMascot';
import LeaderboardList from '../leaderboard/LeaderboardList';
import { useLeaderboard } from '../leaderboard/useLeaderboard';
import DayToggle from '../events/DayToggle';
import EventList from '../events/EventList';
import BeInvolvedList from '../events/BeInvolvedList';
import { useEvents } from '../events/useEvents';

/** JMU logo file (in `public/icons/`). Tinted green below, so its own colors don't matter. */
const JMU_LOGO_SRC = '/icons/jmu-logo.svg';

/**
 * The JMU logo tinted frog green (the file is used as a mask, so its own colors
 * don't matter). Falls back to the text "JMU" until the logo file exists.
 * @returns {import('react').JSX.Element}
 */
function JmuLogo() {
  // width / height of the logo once loaded; 0 = file missing; null = still loading
  const [ratio, setRatio] = useState(/** @type {number | null} */ (null));

  useEffect(() => {
    const img = new Image();
    img.onload = () => setRatio(img.naturalWidth / img.naturalHeight || 2);
    img.onerror = () => setRatio(0);
    img.src = JMU_LOGO_SRC;
  }, []);

  if (!ratio) return <span>JMU</span>;

  const mask = `url(${JMU_LOGO_SRC}) center / contain no-repeat`;
  return (
    <span
      role="img"
      aria-label="JMU"
      className="inline-block bg-frog-700"
      style={{ position: 'relative', top: '0.02em', height: '0.9em', width: `${0.8 * ratio}em`, mask, WebkitMask: mask }}
    />
  );
}

/** Logo lockup used on the logged-out screen. Designer: swap freely. */
function Logo() {
  return (
    <div className="flex flex-col items-center text-center">
      <FrogMascot mood="wave" size={160} />
      <h1 className="mt-2 flex items-center gap-2 text-4xl font-black tracking-tight text-frog-700">
        <JmuLogo /> <span className="text-frog-500">LEAP</span>
      </h1>
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
        <FrogMascot mood="happy" size={56} idle />
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
          <ChatBubbleIcon />
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
