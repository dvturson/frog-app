import { HangingFrog, PomPomFrog } from '../../components/FrogScene';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Ranked list of FROG groups. Last place gets a frog shaking pom-poms; your
 * group's row has a frog hanging off its bottom edge.
 * @param {{
 *   rows: import('../../lib/types').LeaderboardRow[],
 *   highlightGroupId?: string | null,   the viewer's group
 *   showBreakdown?: boolean,            show attendance vs olympics points
 * }} props
 */
export default function LeaderboardList({ rows, highlightGroupId, showBreakdown = false }) {
  if (rows.length === 0) return <p className="text-sm text-neutral-500">No groups yet.</p>;

  return (
    <ol className="space-y-2">
      {rows.map((row, i) => {
        const mine = row.id === highlightGroupId;
        const last = rows.length > 1 && i === rows.length - 1;
        return (
          <li
            key={row.id}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2 ${
              mine ? 'bg-frog-100' : 'bg-neutral-50'
            }`}
          >
            <span className="w-7 text-center text-lg font-bold text-frog-700">
              {MEDALS[row.rank - 1] ?? row.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {row.name}
                {mine && (
                  <span className="ml-2 rounded-full bg-frog-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    YOUR GROUP
                  </span>
                )}
              </p>
              {showBreakdown && (
                <p className="text-xs text-neutral-500">
                  {row.member_points} attendance · {row.olympics_points} FROGlympics
                </p>
              )}
            </div>
            {last && <PomPomFrog size={34} />}
            {mine && <HangingFrog className="right-16" />}
            <span className="text-lg font-extrabold tabular-nums text-frog-800">
              {row.total_points}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
