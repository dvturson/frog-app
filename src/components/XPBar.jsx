import { useState } from 'react';
import { levelFromXp } from '../lib/points';
import { CelEllipse, FrogHead, FrogIris } from './FrogMascot';
import { FROG } from './frogStyle';

const INK = 0.9; // outline width for the small 28x22 frog

/**
 * Small frog head facing left with its mouth open, in the shared frog style. Cheeks puff when `gulpKey` changes.
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
      <FrogHead
        cx={17}
        cy={13}
        rx={11}
        ry={8}
        ink={INK}
        eyes={[
          { cx: 13, cy: 5, r: 4.5 },
          { cx: 22, cy: 5, r: 4.5 },
        ]}
      />
      {/* eyeing the worm */}
      <FrogIris cx={12} cy={5.5} r={2.2} />
      <FrogIris cx={21} cy={5.5} r={2.2} />
      {/* open mouth on the left, where the worm goes in */}
      <path
        d="M6 12 L14 13.5 L6 16 Z"
        fill={FROG.DARK}
        stroke={FROG.DARK}
        strokeWidth={INK}
        strokeLinejoin="round"
      />
      {gulpKey > 0 && (
        <g key={gulpKey} className="cheek-bulge">
          <CelEllipse cx={18} cy={15} rx={7} ry={5} ink={INK} />
          <circle cx="18" cy="15" r="2.5" fill={FROG.BLUSH} />
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
      <span className="rounded-md bg-neutral-800 px-1.5 py-0.5 text-xs font-bold text-neutral-100">
        Lv {level}
      </span>
      <div className="flex flex-1 items-center rounded-full bg-neutral-200 py-0.5 pr-1 pl-2">
        <div
          className="relative h-2.5 flex-1 rounded-full bg-neutral-400"
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
            <div className="worm-wriggle relative h-full w-full rounded-full border border-frog-900 bg-[repeating-linear-gradient(90deg,#f0a3b5_0_5px,#e58aa1_5px_7px)] shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]">
              {/* worm's eye on its free end: dark iris + glint, like the frogs */}
              <span className="absolute top-[1px] left-[2px] h-[4px] w-[4px] rounded-full bg-frog-900">
                <span className="absolute top-[0.5px] left-[0.5px] h-[1.5px] w-[1.5px] rounded-full bg-white" />
              </span>
            </div>
          </div>
        </div>
        <HungryFrog gulpKey={gulpKey} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-neutral-200">
        {intoLevel}/{needed}
      </span>
    </div>
  );
}
