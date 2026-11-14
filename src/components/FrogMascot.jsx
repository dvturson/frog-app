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

import { FROG } from './frogStyle';

const { BODY, SHADE, LIGHT, BELLY, BELLY_SHADE, DARK, BLUSH, TONGUE, INK } = FROG;

/**
 * Cel-shading: an ellipse drawn in a flat shadow tone, a flat lit ellipse on top
 * (shrunk toward the upper-left so a hard-edged shadow crescent shows on the
 * lower-right), then an ink outline.
 * @param {{
 *   cx: number, cy: number, rx: number, ry: number,
 *   base?: string, shade?: string, outline?: boolean,
 *   ink?: number,        outline width (scale it down for small viewBoxes)
 *   inkColor?: string,
 * }} props
 * @returns {import('react').JSX.Element}
 */
export function CelEllipse({
  cx,
  cy,
  rx,
  ry,
  base = BODY,
  shade = SHADE,
  outline = true,
  ink = INK,
  inkColor = DARK,
}) {
  // Shrink toward the point on the rim at 225° (upper-left), so the lit shape
  // stays inside and touches the rim there.
  const k = 0.86;
  const ax = cx - rx * Math.SQRT1_2;
  const ay = cy - ry * Math.SQRT1_2;
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={shade} />
      <ellipse
        cx={ax + (cx - ax) * k}
        cy={ay + (cy - ay) * k}
        rx={rx * k}
        ry={ry * k}
        fill={base}
      />
      {outline && (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={inkColor} strokeWidth={ink} />
      )}
    </>
  );
}

/**
 * Head + eye domes with ONE outline around the whole silhouette (a thick ink
 * stroke under all the shapes, fills on top), so each eye's outline stops where
 * it meets the head. The head is cel-shaded; the eye domes are flat.
 * @param {{
 *   cx: number, cy: number, rx: number, ry: number,
 *   eyes: { cx: number, cy: number, r: number }[],
 *   ink?: number, base?: string, shade?: string, inkColor?: string,
 * }} props
 * @returns {import('react').JSX.Element}
 */
export function FrogHead({
  cx,
  cy,
  rx,
  ry,
  eyes,
  ink = INK,
  base = BODY,
  shade = SHADE,
  inkColor = DARK,
}) {
  return (
    <>
      <g fill={inkColor} stroke={inkColor} strokeWidth={ink * 2}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        {eyes.map((e) => (
          <circle key={e.cx} cx={e.cx} cy={e.cy} r={e.r} />
        ))}
      </g>
      <CelEllipse cx={cx} cy={cy} rx={rx} ry={ry} base={base} shade={shade} outline={false} />
      {eyes.map((e) => (
        <circle key={e.cx} cx={e.cx} cy={e.cy} r={e.r} fill={base} />
      ))}
    </>
  );
}

/**
 * Dark iris with a hard white glint (no eye white).
 * @param {{ cx: number, cy: number, r: number, color?: string }} props
 * @returns {import('react').JSX.Element}
 */
export function FrogIris({ cx, cy, r, color = DARK }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx - r * 0.4} cy={cy - r * 0.4} r={r * 0.3} fill="#fff" />
    </>
  );
}

/**
 * The frog's mouth: a sideways "3" with the outer ends cut off. The middle point
 * sits at the head's center and each side curves gently down to a flat corner.
 * Pass the head ellipse; the mouth scales with it.
 * @param {{ cx: number, cy: number, rx: number, ry: number, color?: string, width?: number }} props
 * @returns {import('react').JSX.Element}
 */
export function FrogMouth({ cx, cy, rx, ry, color = DARK, width }) {
  /** @param {number} fx @param {number} fy */
  const p = (fx, fy) => `${cx + fx * rx} ${cy + fy * ry}`;
  const d =
    `M${p(-0.556, 0.375)} C${p(-0.389, 0.417)} ${p(-0.194, 0.333)} ${p(0, 0)} ` +
    `C${p(0.194, 0.333)} ${p(0.389, 0.417)} ${p(0.556, 0.375)}`;
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={width ?? ry * 0.125}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="miter"
    />
  );
}

/**
 * Arm / leg: an ink stroke with the skin stroke on top, so it reads as outlined.
 * @param {{ d: string, width?: number, ink?: number, className?: string, children?: import('react').ReactNode }} props
 * @returns {import('react').JSX.Element}
 */
export function Limb({ d, width = 10, ink = INK, className, children }) {
  return (
    <g className={className}>
      <path d={d} stroke={DARK} strokeWidth={width + ink * 2} strokeLinecap="round" fill="none" />
      <path d={d} stroke={BODY} strokeWidth={width} strokeLinecap="round" fill="none" />
      {children}
    </g>
  );
}

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

/** Eye domes sit on top of the head at these x positions, y = EYE_Y, radius EYE_R. */
const EYE_Y = 30;
const EYE_R = 12;

/**
 * One eye's iris (the dome itself comes from FrogHead). Closed eyes are drawn as a lid line.
 * @param {{ cx: number, closed: boolean, pupil: { x: number, y: number }, pupilR?: number }} props
 */
function Eye({ cx, closed, pupil, pupilR = 6 }) {
  return (
    <>
      {closed ? (
        <path
          d={`M${cx - 8} 30 Q${cx} 36 ${cx + 8} 30`}
          stroke={DARK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <FrogIris cx={cx + 1 + pupil.x} cy={31 + pupil.y} r={pupilR} />
      )}
    </>
  );
}

/**
 * The frog drawing itself, as an SVG <g> in a 120x120 box. Used by FrogMascot
 * and by the empty-state scenes in FrogScene. Flat cel-shaded colors with ink outlines.
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
    <g strokeLinejoin="round">
      {/* arms (behind body) */}
      {mood === 'cheer' && (
        <>
          <Limb d="M30 72 L14 40" />
          <Limb d="M90 72 L106 40" />
        </>
      )}
      {mood === 'wave' && (
        <>
          <Limb d="M30 78 L18 94" />
          <g>
            <Limb d="M90 72 L108 46" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 90 72; -14 90 72; 0 90 72"
              dur="1s"
              repeatCount="indefinite"
            />
          </g>
        </>
      )}
      {(mood === 'happy' || mood === 'confused' || mood === 'chill') && (
        <>
          <Limb d="M30 78 L18 94" />
          <Limb d="M90 78 L102 94" />
        </>
      )}
      {/* guard: right arm is drawn by the caller (see GuardFrog's salute) */}
      {mood === 'guard' && <Limb d="M30 78 L18 94" />}

      {/* body + belly */}
      <CelEllipse cx={60} cy={78} rx={34} ry={30} />
      <CelEllipse
        cx={60}
        cy={86}
        rx={20}
        ry={17}
        base={BELLY}
        shade={BELLY_SHADE}
        outline={false}
      />
      <ellipse cx="41" cy="70" rx="5" ry="2.5" fill={LIGHT} transform="rotate(-35 41 70)" />

      {/* head + eyes: one shared outline around the whole silhouette */}
      <FrogHead
        cx={60}
        cy={50}
        rx={36}
        ry={24}
        eyes={[
          { cx: 42, cy: EYE_Y, r: EYE_R },
          { cx: 78, cy: EYE_Y, r: EYE_R },
        ]}
      />
      <ellipse cx="60" cy="35" rx="6" ry="2.5" fill={LIGHT} />
      {mood === 'confused' ? (
        <>
          <Eye cx={42} closed={blink} pupil={{ x: -2, y: -3 }} pupilR={4} />
          <Eye cx={78} closed={blink} pupil={{ x: 1, y: 1 }} pupilR={7.5} />
          <path d="M32 14 L50 19" stroke={DARK} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Eye cx={42} closed={eyesClosed} pupil={pupil} />
          <Eye cx={78} closed={eyesClosed} pupil={pupil} />
        </>
      )}

      {/* mouth: same for every mood (see FrogMouth); the tongue-flick gag swaps it for an open mouth */}
      {mouth === 'open' ? (
        <ellipse cx="61" cy="57" rx="13" ry="7" fill={DARK} />
      ) : (
        <FrogMouth cx={60} cy={50} rx={36} ry={24} />
      )}

      {/* cheeks: puff out while gulping */}
      {gulp ? (
        <g className="cheek-bulge">
          <CelEllipse cx={30} cy={58} rx={10} ry={8} />
          <CelEllipse cx={90} cy={58} rx={10} ry={8} />
          <circle cx="30" cy="58" r="5" fill={BLUSH} />
          <circle cx="90" cy="58" r="5" fill={BLUSH} />
        </g>
      ) : (
        <>
          <ellipse cx="32" cy="58" rx="4" ry="2.5" fill={BLUSH} opacity="0.8" />
          <ellipse cx="88" cy="58" rx="4" ry="2.5" fill={BLUSH} opacity="0.8" />
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
        <g>
          {/* ink stroke under the pink one; both shoot out together */}
          {[
            { color: DARK, width: 4 + INK * 2 },
            { color: TONGUE, width: 4 },
          ].map((t) => (
            <line
              key={t.color}
              x1="64"
              y1="57"
              x2={FLY_AT.x}
              y2={FLY_AT.y}
              stroke={t.color}
              strokeWidth={t.width}
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              className="frog-tongue"
            />
          ))}
        </g>
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
