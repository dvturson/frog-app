import { levelFromXp } from '../lib/points';

/**
 * Level badge + progress bar toward the next level.
 * @param {{ xp: number, className?: string }} props
 */
export default function XPBar({ xp, className = '' }) {
  const { level, intoLevel, needed, percent } = levelFromXp(xp);
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="rounded-md bg-frog-600 px-1.5 py-0.5 text-xs font-bold text-white">
        Lv {level}
      </span>
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-frog-100"
        role="progressbar"
        aria-valuenow={intoLevel}
        aria-valuemax={needed}
        aria-label="XP toward next level"
      >
        <div
          className="h-full rounded-full bg-frog-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-neutral-500">
        {intoLevel}/{needed}
      </span>
    </div>
  );
}
