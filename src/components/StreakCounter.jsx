/**
 * Frog face with a twinkle star. Lit while you have a streak; at 0 the face goes
 * grey and frowns, and the star is just a puff of smoke.
 * @param {{ lit: boolean }} props
 */
function StreakFrog({ lit }) {
  const skin = lit ? '#3a9a4b' : '#9ca3af';
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" style={{ overflow: 'visible' }} aria-hidden="true">
      <ellipse cx="10" cy="15" rx="9" ry="7" fill={skin} />
      <circle cx="5.5" cy="9" r="3.5" fill={skin} />
      <circle cx="14.5" cy="9" r="3.5" fill={skin} />
      <circle cx="5.5" cy="9" r="2.2" fill="#fff" />
      <circle cx="14.5" cy="9" r="2.2" fill="#fff" />
      <circle cx="5.8" cy={lit ? 9 : 9.8} r="1.1" fill="#1c4825" />
      <circle cx="14.8" cy={lit ? 9 : 9.8} r="1.1" fill="#1c4825" />
      <path
        d={lit ? 'M6.5 15.5 Q10 18.5 13.5 15.5' : 'M6.5 17.5 Q10 15 13.5 17.5'}
        stroke="#1c4825"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      {lit ? (
        <path
          className="spark"
          d="M21 0 L22 3 L25 4 L22 5 L21 8 L20 5 L17 4 L20 3 Z"
          fill="#f5c242"
        />
      ) : (
        <circle className="smoke" cx="21" cy="4" r="2" fill="#d1d5db" />
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
        active ? 'bg-gold-400/20 text-gold-500' : 'bg-neutral-100 text-neutral-400'
      }`}
      title={`${days}-day streak`}
    >
      <StreakFrog lit={active} />
      <span>{days}</span>
      <span className="sr-only">day streak</span>
    </div>
  );
}
