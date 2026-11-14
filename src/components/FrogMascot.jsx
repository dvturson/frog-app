/**
 * PLACEHOLDER MASCOT: designer, replace the SVG art in FrogFigure.
 * Keep the props the same so nothing else has to change.
 *
 * Behaviour (all skipped when the OS asks for reduced motion):
 * - pupils follow the pointer / last tap (`track`)
 * - blinks at random intervals
 * - `idle`: after 10s with no input, catches a fly with its tongue, then acts normal
 */
import { useEffect, useRef, useState } from 'react';

const BODY = '#3a9a4b';
const BELLY = '#bbe3c1';
const DARK = '#1c4825';
const BLUSH = '#f9a8b8';
const TONGUE = '#e86a8a';

/** Where the fly lands, in the 120x120 viewBox (right of the head, clear of the eye). */
const FLY_AT = { x: 112, y: 44 };
const IDLE_MS = 10_000;

/** @typedef {'happy' | 'cheer' | 'wave' | 'confused' | 'chill' | 'guard'} FrogMood */

/** @returns {boolean} */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * One eye: green dome, white, pupil. Closed eyes are drawn as a lid line.
 * @param {{ cx: number, closed: boolean, pupil: { x: number, y: number }, pupilR?: number }} props
 */
function Eye({ cx, closed, pupil, pupilR = 4 }) {
  return (
    <>
      <circle cx={cx} cy="30" r="12" fill={BODY} />
      {closed ? (
        <path
          d={`M${cx - 8} 30 Q${cx} 36 ${cx + 8} 30`}
          stroke={DARK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx={cx} cy="30" r="8" fill="#fff" />
          <circle cx={cx + 1 + pupil.x} cy={31 + pupil.y} r={pupilR} fill={DARK} />
        </>
      )}
    </>
  );
}

/**
 * The frog drawing itself, as an SVG <g> in a 120x120 box. Used by FrogMascot
 * and by the empty-state scenes in FrogScene.
 * @param {{
 *   mood?: FrogMood,
 *   pupil?: { x: number, y: number },   pupil offset in viewBox units (max ~3)
 *   blink?: boolean,
 *   mouth?: 'open',                     force an open mouth (tongue flick)
 *   gulp?: boolean,                     cheeks puff out
 * }} props
 * @returns {import('react').JSX.Element}
 */
export function FrogFigure({ mood = 'happy', pupil = { x: 0, y: 0 }, blink = false, mouth, gulp }) {
  const eyesClosed = blink || gulp || mood === 'chill';

  return (
    <g>
      {/* arms (behind body) */}
      {mood === 'cheer' && (
        <>
          <path d="M30 72 L14 40" stroke={BODY} strokeWidth="10" strokeLinecap="round" />
          <path d="M90 72 L106 40" stroke={BODY} strokeWidth="10" strokeLinecap="round" />
        </>
      )}
      {mood === 'wave' && (
        <>
          <path d="M30 78 L18 94" stroke={BODY} strokeWidth="10" strokeLinecap="round" />
          <path d="M90 72 L108 46" stroke={BODY} strokeWidth="10" strokeLinecap="round">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 90 72; -14 90 72; 0 90 72"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </>
      )}
      {(mood === 'happy' || mood === 'confused' || mood === 'chill') && (
        <>
          <path d="M30 78 L18 94" stroke={BODY} strokeWidth="10" strokeLinecap="round" />
          <path d="M90 78 L102 94" stroke={BODY} strokeWidth="10" strokeLinecap="round" />
        </>
      )}
      {/* guard: right arm is drawn by the caller (see GuardFrog's salute) */}
      {mood === 'guard' && (
        <path d="M30 78 L18 94" stroke={BODY} strokeWidth="10" strokeLinecap="round" />
      )}

      {/* body + belly */}
      <ellipse cx="60" cy="78" rx="34" ry="30" fill={BODY} />
      <ellipse cx="60" cy="86" rx="20" ry="17" fill={BELLY} />

      {/* head + eyes */}
      <ellipse cx="60" cy="50" rx="36" ry="24" fill={BODY} />
      {mood === 'confused' ? (
        <>
          <Eye cx={42} closed={blink} pupil={{ x: -2, y: -3 }} pupilR={2.5} />
          <Eye cx={78} closed={blink} pupil={{ x: 2, y: 1 }} pupilR={5} />
          <path d="M32 14 L50 19" stroke={DARK} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Eye cx={42} closed={eyesClosed} pupil={pupil} />
          <Eye cx={78} closed={eyesClosed} pupil={pupil} />
        </>
      )}

      {/* mouth */}
      {mouth === 'open' ? (
        <ellipse cx="62" cy="57" rx="9" ry="6" fill={DARK} />
      ) : mood === 'cheer' ? (
        <path d="M46 52 Q60 70 74 52 Z" fill={DARK} />
      ) : mood === 'guard' ? (
        <path d="M50 58 L70 58" stroke={DARK} strokeWidth="3" strokeLinecap="round" />
      ) : mood === 'confused' ? (
        <path
          d="M47 57 q4 -4 8 0 t8 0 t8 0"
          stroke={DARK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M46 54 Q60 64 74 54"
          stroke={DARK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* cheeks: puff out while gulping */}
      {gulp ? (
        <g className="cheek-bulge">
          <ellipse cx="30" cy="58" rx="10" ry="8" fill={BODY} />
          <ellipse cx="90" cy="58" rx="10" ry="8" fill={BODY} />
          <circle cx="30" cy="58" r="5" fill={BLUSH} />
          <circle cx="90" cy="58" r="5" fill={BLUSH} />
        </g>
      ) : (
        <>
          <circle cx="34" cy="56" r="4" fill={BLUSH} opacity="0.7" />
          <circle cx="86" cy="56" r="4" fill={BLUSH} opacity="0.7" />
        </>
      )}
    </g>
  );
}

/** Tiny buzzing fly, drawn around (0,0). */
function Fly() {
  return (
    <g>
      <ellipse
        cx="-2"
        cy="-4"
        rx="3.5"
        ry="2.5"
        fill="#fff"
        opacity="0.85"
        className="frog-fly-wings"
      />
      <ellipse
        cx="2"
        cy="-4"
        rx="3.5"
        ry="2.5"
        fill="#fff"
        opacity="0.85"
        className="frog-fly-wings"
      />
      <circle r="3" fill="#222" />
    </g>
  );
}

/**
 * Pupil offset that points at the pointer / last tap.
 * @param {import('react').RefObject<SVGSVGElement | null>} svgRef
 * @param {boolean} enabled
 * @returns {{ x: number, y: number }}
 */
function usePointerGaze(svgRef, enabled) {
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    let frame = 0;
    /** @param {PointerEvent} e */
    const onPointer = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = svgRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.25); // eye height
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 120) * 3;
        setGaze({ x: (dx / dist) * reach, y: (dy / dist) * reach });
      });
    };
    window.addEventListener('pointermove', onPointer);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [svgRef, enabled]);

  return gaze;
}

/** @returns {boolean} true for ~140ms every few seconds. */
function useBlink() {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          setBlink(true);
          timer = window.setTimeout(() => {
            setBlink(false);
            schedule();
          }, 140);
        },
        2500 + Math.random() * 4000,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return blink;
}

/**
 * Idle antic: after IDLE_MS without input, a fly buzzes in and gets eaten.
 * @param {boolean} enabled
 * @returns {'none' | 'fly' | 'tongue' | 'gulp'}
 */
function useIdleAntic(enabled) {
  const [antic, setAntic] = useState(/** @type {'none' | 'fly' | 'tongue' | 'gulp'} */ ('none'));

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    let idleTimer = 0;
    /** @type {number[]} */
    let steps = [];

    const run = () => {
      setAntic('fly');
      steps = [
        window.setTimeout(() => setAntic('tongue'), 1600),
        window.setTimeout(() => setAntic('gulp'), 1920),
        window.setTimeout(() => {
          setAntic('none');
          steps = [];
          arm();
        }, 2900),
      ];
    };
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(run, IDLE_MS);
    };
    // Any input restarts the countdown, but never interrupts a fly already in progress.
    const onActivity = () => {
      if (steps.length === 0) arm();
    };

    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    arm();
    return () => {
      clearTimeout(idleTimer);
      steps.forEach(clearTimeout);
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [enabled]);

  return antic;
}

/**
 * The app mascot.
 * @param {{
 *   mood?: FrogMood,
 *   size?: number,
 *   className?: string,
 *   track?: boolean,   eyes follow the pointer / last tap (default true)
 *   idle?: boolean,    catch a fly after 10s of no input (use on one frog per screen)
 * }} props
 * @returns {import('react').JSX.Element}
 */
export default function FrogMascot({
  mood = 'happy',
  size = 120,
  className = '',
  track = true,
  idle = false,
}) {
  /** @type {import('react').RefObject<SVGSVGElement | null>} */
  const svgRef = useRef(null);
  const gaze = usePointerGaze(svgRef, track);
  const blink = useBlink();
  const antic = useIdleAntic(idle);

  // While a fly is around, stare at it instead of the pointer.
  const pupil = antic === 'fly' || antic === 'tongue' ? { x: 3, y: 0.5 } : gaze;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible' }}
      role="img"
      aria-label={`Frog mascot (${mood})`}
    >
      <FrogFigure
        mood={mood}
        pupil={pupil}
        blink={blink && antic === 'none'}
        mouth={antic === 'tongue' ? 'open' : undefined}
        gulp={antic === 'gulp'}
      />

      {antic === 'tongue' && (
        <line
          x1="64"
          y1="57"
          x2={FLY_AT.x}
          y2={FLY_AT.y}
          stroke={TONGUE}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          className="frog-tongue"
        />
      )}
      {(antic === 'fly' || antic === 'tongue') && (
        <g transform={`translate(${FLY_AT.x} ${FLY_AT.y})`}>
          <g className="frog-fly">
            <Fly />
          </g>
        </g>
      )}
    </svg>
  );
}
