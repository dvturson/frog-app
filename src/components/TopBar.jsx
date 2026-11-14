import { useAuth } from '../lib/auth/useAuth';
import { liveStreak } from '../lib/points';
import StreakCounter from './StreakCounter';
import XPBar from './XPBar';

/** Sticky bar on every tab: streak on the left, XP + level on the right. */
export default function TopBar() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-frog-600 px-4 py-2.5 shadow-sm">
      <StreakCounter days={liveStreak(profile.current_streak, profile.last_active_date)} />
      <XPBar xp={profile.xp} className="flex-1" />
    </header>
  );
}
