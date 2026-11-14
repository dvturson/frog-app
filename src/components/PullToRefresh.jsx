import { useId, useRef, useState } from 'react';
import { CelEllipse, FrogHead, FrogIris, FrogMouth } from './FrogMascot';
import { FROG } from './frogStyle';

const THRESHOLD = 80; // px of (dampened) pull needed to refresh
const MAX_PULL = 150;
const INK = 1.8; // outline width at this drawing's size

/**
 * A frog stuck to the top edge by its feet, stretched like taffy as you pull.
 * @param {{ pull: number }} props pull distance in px
 */
function StretchyFrog({ pull }) {
  const clipId = `stretch-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const h = Math.max(pull, 1);
  const stretch = Math.min(pull / MAX_PULL, 1);
  const neckW = 34 - stretch * 22; // body gets skinnier the further you pull
  const headY = h - 16;
  const ready = pull >= THRESHOLD;
  const irisR = Math.max(1.8, 4.5 - stretch * 2.7); // irises shrink in alarm
  const body = `M${40 - 18} 0 C${40 - neckW / 2} ${h * 0.35}, ${40 - neckW / 2} ${h * 0.6}, ${40 - 20} ${headY}
            L${40 + 20} ${headY} C${40 + neckW / 2} ${h * 0.6}, ${40 + neckW / 2} ${h * 0.35}, ${40 + 18} 0 Z`;

  return (
    <svg
      width="80"
      height={h}
      viewBox={`0 0 80 ${h}`}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* feet stuck to the top */}
      <CelEllipse cx={26} cy={2} rx={9} ry={4} ink={INK} />
      <CelEllipse cx={54} cy={2} rx={9} ry={4} ink={INK} />
      {/* stretched body: shadow tone, a lit copy shifted left (clipped to the body)
          leaves a hard shadow strip down the right side, then the ink outline */}
      <path d={body} fill={FROG.SHADE} />
      <path d={body} fill={FROG.BODY} transform="translate(-6 0)" clipPath={`url(#${clipId})`} />
      <path d={body} fill="none" stroke={FROG.DARK} strokeWidth={INK} strokeLinejoin="round" />
      {/* head at the bottom */}
      <FrogHead
        cx={40}
        cy={headY}
        rx={22}
        ry={15}
        ink={INK}
        eyes={[
          { cx: 30, cy: headY - 10, r: 7 },
          { cx: 50, cy: headY - 10, r: 7 },
        ]}
      />
      <FrogIris cx={30} cy={headY - 9} r={irisR} />
      <FrogIris cx={50} cy={headY - 9} r={irisR} />
      {ready ? (
        <ellipse cx="40" cy={headY + 4} rx="5" ry="4" fill={FROG.DARK} />
      ) : (
        <FrogMouth cx={40} cy={headY} rx={22} ry={15} width={2} />
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
