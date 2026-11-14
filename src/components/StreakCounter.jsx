/**
 * Flame + number of consecutive days with a FROG event.
 * @param {{ days: number }} props
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
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M12 2c1 3.5-1.5 5.5-1.5 8a2.5 2.5 0 0 0 5 0c0-1-.3-2-.8-2.8C17.5 9 19 11.6 19 14.5A7 7 0 0 1 5 14.5C5 9.5 10 7 12 2Z" />
      </svg>
      <span>{days}</span>
      <span className="sr-only">day streak</span>
    </div>
  );
}
