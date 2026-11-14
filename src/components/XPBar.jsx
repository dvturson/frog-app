import { useState } from 'react';
import { levelFromXp } from '../lib/points';

/**
 * Small frog head facing left with its mouth open. Cheeks puff when `gulpKey` changes.
 * @param {{ gulpKey: number }} props
 */
function HungryFrog({ gulpKey }) {
  return (
    <svg
      viewBox="0 0 28 22"
      className="h-6 w-7 shrink-0"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <ellipse cx="17" cy="13" rx="11" ry="8" fill="#3a9a4b" />
      <circle cx="13" cy="5" r="4.5" fill="#3a9a4b" />
      <circle cx="22" cy="5" r="4.5" fill="#3a9a4b" />
      <circle cx="13" cy="5" r="3" fill="#fff" />
      <circle cx="22" cy="5" r="3" fill="#fff" />
      <circle cx="12" cy="5.5" r="1.5" fill="#1c4825" />
      <circle cx="21" cy="5.5" r="1.5" fill="#1c4825" />
      {/* open mouth on the left, where the worm goes in */}
      <path d="M6 12 L14 13.5 L6 16 Z" fill="#1c4825" />
      {gulpKey > 0 && (
        <g key={gulpKey} className="cheek-bulge">
          <ellipse cx="18" cy="15" rx="7" ry="5" fill="#3a9a4b" />
          <circle cx="18" cy="15" r="2.5" fill="#f9a8b8" />
        </g>
      )}
    </svg>
  );
}

/**
 * Level badge + "progress bar" where a frog slurps a worm. The worm left over is
 * the XP still needed; it gets shorter as you earn XP, and the frog's cheeks puff
 * out when you level up.
 * @param {{ xp: number, className?: string }} props
 * @returns {import('react').JSX.Element}
 */
export default function XPBar({ xp, className = '' }) {
  const { level, intoLevel, needed, percent } = levelFromXp(xp);

  // Detect level-ups during render (no effect needed): bump a key to replay the gulp.
  const [seenLevel, setSeenLevel] = useState(level);
  const [gulpKey, setGulpKey] = useState(0);
  if (level !== seenLevel) {
    setSeenLevel(level);
    if (level > seenLevel) setGulpKey((k) => k + 1);
  }

  const wormLeft = Math.min(percent, 94); // always leave a stub of worm hanging out

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="rounded-md bg-frog-600 px-1.5 py-0.5 text-xs font-bold text-white">
        Lv {level}
      </span>
      <div className="flex flex-1 items-center">
        <div
          className="relative h-2.5 flex-1 rounded-full bg-frog-100"
          role="progressbar"
          aria-valuenow={intoLevel}
          aria-valuemax={needed}
          aria-label="XP toward next level"
        >
          {/* the worm: from the current progress point into the frog's mouth */}
          <div
            className="absolute inset-y-0 right-[-6px] transition-[left] duration-700 ease-out"
            style={{ left: `${wormLeft}%` }}
          >
            <div className="worm-wriggle relative h-full w-full rounded-full bg-[repeating-linear-gradient(90deg,#f0a3b5_0_5px,#e58aa1_5px_7px)]">
              {/* worm's alarmed eye on its free end */}
              <span className="absolute top-[2px] left-[3px] h-[4px] w-[4px] rounded-full bg-white">
                <span className="absolute top-[1px] left-0 h-[2px] w-[2px] rounded-full bg-neutral-900" />
              </span>
            </div>
          </div>
        </div>
        <HungryFrog gulpKey={gulpKey} />
      </div>
      <span className="text-xs tabular-nums text-neutral-500">
        {intoLevel}/{needed}
      </span>
    </div>
  );
}
