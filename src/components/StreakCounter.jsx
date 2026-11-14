import { FrogHead, FrogIris, FrogMouth } from './FrogMascot';
import { FROG } from './frogStyle';

const INK = 1; // outline width for this 24x24 drawing
const GREY = { base: '#9ca3af', shade: '#6b7280', ink: '#4b5563' };

/**
 * Frog face (shared frog style) with a twinkle star. Lit while you have a streak;
 * at 0 the face goes grey and frowns, and the star is just a puff of smoke.
 * @param {{ lit: boolean }} props
 */
function StreakFrog({ lit }) {
  const ink = lit ? FROG.DARK : GREY.ink;
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" style={{ overflow: 'visible' }} aria-hidden="true">
      <FrogHead
        cx={10}
        cy={15}
        rx={9}
        ry={7}
        ink={INK}
        inkColor={ink}
        base={lit ? FROG.BODY : GREY.base}
        shade={lit ? FROG.SHADE : GREY.shade}
        eyes={[
          { cx: 5.5, cy: 9, r: 3.5 },
          { cx: 14.5, cy: 9, r: 3.5 },
        ]}
      />
      <FrogIris cx={5.8} cy={lit ? 9 : 9.8} r={1.7} color={ink} />
      <FrogIris cx={14.8} cy={lit ? 9 : 9.8} r={1.7} color={ink} />
      {lit ? (
        <FrogMouth cx={10} cy={15} rx={9} ry={7} width={1.1} />
      ) : (
        <path
          d="M6.5 18 Q10 15.5 13.5 18"
          stroke={ink}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {lit ? (
        <path
          className="spark"
          d="M21 0 L22 3 L25 4 L22 5 L21 8 L20 5 L17 4 L20 3 Z"
          fill={FROG.GOLD}
          stroke={FROG.DARK}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      ) : (
        <circle
          className="smoke"
          cx="21"
          cy="4"
          r="2"
          fill="#d1d5db"
          stroke="#9ca3af"
          strokeWidth="0.8"
        />
      )}
    </svg>
  );
}

/**
 * Frog face + number of consecutive days with a FROG event.
 * @param {{ days: number }} props
 * @returns {import('react').JSX.Element}
 */
export default function StreakCounter({ days }) {
  const active = days > 0;
  return (
    <div
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold ${
        active ? 'bg-neutral-100 text-neutral-800' : 'bg-neutral-300 text-neutral-500'
      }`}
      title={`${days}-day streak`}
    >
      <StreakFrog lit={active} />
      <span>{days}</span>
      <span className="sr-only">day streak</span>
    </div>
  );
}
