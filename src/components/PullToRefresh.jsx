import { useRef, useState } from 'react';

const THRESHOLD = 80; // px of (dampened) pull needed to refresh
const MAX_PULL = 150;

/**
 * A frog stuck to the top edge by its feet, stretched like taffy as you pull.
 * @param {{ pull: number }} props pull distance in px
 */
function StretchyFrog({ pull }) {
  const h = Math.max(pull, 1);
  const stretch = Math.min(pull / MAX_PULL, 1);
  const neckW = 34 - stretch * 22; // body gets skinnier the further you pull
  const headY = h - 16;
  const ready = pull >= THRESHOLD;
  const eyeR = 3 + stretch * 3; // eyes widen in alarm

  return (
    <svg
      width="80"
      height={h}
      viewBox={`0 0 80 ${h}`}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* feet stuck to the top */}
      <ellipse cx="26" cy="2" rx="9" ry="4" fill="#2e8b3e" />
      <ellipse cx="54" cy="2" rx="9" ry="4" fill="#2e8b3e" />
      {/* stretched body */}
      <path
        d={`M${40 - 18} 0 C${40 - neckW / 2} ${h * 0.35}, ${40 - neckW / 2} ${h * 0.6}, ${40 - 20} ${headY}
            L${40 + 20} ${headY} C${40 + neckW / 2} ${h * 0.6}, ${40 + neckW / 2} ${h * 0.35}, ${40 + 18} 0 Z`}
        fill="#3a9a4b"
      />
      {/* head at the bottom */}
      <ellipse cx="40" cy={headY} rx="22" ry="15" fill="#3a9a4b" />
      <circle cx="30" cy={headY - 10} r="7" fill="#3a9a4b" />
      <circle cx="50" cy={headY - 10} r="7" fill="#3a9a4b" />
      <circle cx="30" cy={headY - 10} r={eyeR + 1.5} fill="#fff" />
      <circle cx="50" cy={headY - 10} r={eyeR + 1.5} fill="#fff" />
      <circle cx="30" cy={headY - 9} r={Math.max(1.2, 3 - stretch * 1.8)} fill="#1c4825" />
      <circle cx="50" cy={headY - 9} r={Math.max(1.2, 3 - stretch * 1.8)} fill="#1c4825" />
      {ready ? (
        <ellipse cx="40" cy={headY + 4} rx="5" ry="4" fill="#1c4825" />
      ) : (
        <path
          d={`M33 ${headY + 3} Q40 ${headY + 7} 47 ${headY + 3}`}
          stroke="#1c4825"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/**
 * Pull down from the top of the page to refresh. Shows a stretching frog that
 * snaps back with a boing on release.
 * @param {{ onRefresh: () => void, children: import('react').ReactNode }} props
 * @returns {import('react').JSX.Element}
 */
export default function PullToRefresh({ onRefresh, children }) {
  const startY = useRef(/** @type {number | null} */ (null));
  const [pull, setPull] = useState(0);
  const [snapFrom, setSnapFrom] = useState(0); // pull distance at release, while the frog boings back

  /** @param {import('react').TouchEvent} e */
  function onTouchStart(e) {
    startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
  }

  /** @param {import('react').TouchEvent} e */
  function onTouchMove(e) {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0 || window.scrollY > 0) {
      setPull(0);
      return;
    }
    setPull(Math.min(MAX_PULL, dy * 0.55)); // resistance
  }

  function onTouchEnd() {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD) {
      navigator.vibrate?.(20);
      onRefresh();
    }
    if (pull > 4) setSnapFrom(pull);
    setPull(0);
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="relative z-10 flex justify-center"
        style={{ height: pull, transition: pull === 0 ? 'height 200ms ease-out' : 'none' }}
      >
        {pull > 4 && <StretchyFrog pull={pull} />}
        {pull === 0 && snapFrom > 0 && (
          <div className="frog-snap absolute top-0" onAnimationEnd={() => setSnapFrom(0)}>
            <StretchyFrog pull={snapFrom} />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
