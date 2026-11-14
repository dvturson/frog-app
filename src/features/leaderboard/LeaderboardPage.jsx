/**
 * LEADERBOARD TAB
 * TODO:
 * - [ ] Animate rank changes when realtime updates arrive
 * - [ ] Recent FROGlympics results section (olympics_results joined to events)
 * - [ ] Top individual contributors inside your group (profiles.points)
 */
import Card from '../../components/Card';
import FrogMascot from '../../components/FrogMascot';
import FrogScene from '../../components/FrogScene';
import { useAuth } from '../../lib/auth/useAuth';
import LeaderboardList from './LeaderboardList';
import { useLeaderboard } from './useLeaderboard';

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const { rows, loading, error } = useLeaderboard();

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <FrogMascot mood="cheer" size={64} />
        <div>
          <h1 className="text-2xl font-extrabold text-frog-900">Leaderboard</h1>
          <p className="text-sm text-neutral-500">Every check counts for your group.</p>
        </div>
      </div>

      <Card title="FROG groups">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : error ? (
          <FrogScene scene="tangled">
            <span className="text-red-600">{error}</span>
          </FrogScene>
        ) : (
          <LeaderboardList rows={rows} highlightGroupId={profile?.frog_group_id} showBreakdown />
        )}
      </Card>

      <Card title="How points work">
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600">
          <li>+1 for each group member who scans in and stays for the event.</li>
          <li>
            Streak bonus: on day <em>n</em> of your streak, your first optional event earns +
            <em>n</em>.
          </li>
          <li>FROGlympics: 1st 40 · 2nd 20 · 3rd 10 · 4th 5 (after admin verifies).</li>
        </ul>
      </Card>
    </div>
  );
}
