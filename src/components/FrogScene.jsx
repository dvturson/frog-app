/**
 * Little illustrated scenes for empty and error states. Designer: swap the art
 * freely; keep the `scene` names so call sites don't change.
 *
 * - tea:     empty chat. Frog alone at a table with two cups, eyeing the empty chair.
 * - pool:    no events. Frog floating in a pool ring under a beach umbrella.
 * - tangled: errors / offline. Frog wrapped in its own cord, holding the unplugged plug.
 *
 * Also exports small standalone frogs: PomPomFrog, HangingFrog, GuardFrog.
 */
import { CelEllipse, FrogFigure, FrogHead, FrogIris, FrogMouth, Limb } from './FrogMascot';
import { FROG } from './frogStyle';

const { DARK, INK, GOLD, GOLD_SHADE, BELLY, BELLY_SHADE } = FROG;
const WOOD = '#c08a5b';
const WATER = '#bfe6f5';
const CORD = '#6b7280';

/** Two wavy steam lines rising from (x, y). @param {{ x: number, y: number }} props */
function Steam({ x, y }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      stroke="#9ca3af"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    >
      <path className="steam" d="M0 0 q-3 -4 0 -8 t0 -8" />
      <path className="steam" style={{ animationDelay: '1.2s' }} d="M5 0 q-3 -4 0 -8 t0 -8" />
    </g>
  );
}

/** Teacup with its rim at (x, y). @param {{ x: number, y: number }} props */
function Cup({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={DARK} strokeWidth="1.5">
      <path d="M14 3 a4 4 0 1 1 0 6" fill="none" />
      <path d="M0 0 h14 v6 a7 7 0 0 1 -14 0 z" fill="#fff" />
    </g>
  );
}

function TeaScene() {
  return (
    <>
      {/* empty chair, right */}
      <g stroke={DARK} strokeWidth="2" strokeLinecap="round">
        <line x1="186" y1="62" x2="186" y2="124" />
        <line x1="164" y1="100" x2="164" y2="124" />
        <rect x="160" y="96" width="30" height="5" rx="2" fill={WOOD} />
      </g>
      {/* frog, left, looking at the chair */}
      <g transform="translate(4 22) scale(0.85)">
        <FrogFigure mood="happy" pupil={{ x: 3, y: 1 }} />
      </g>
      {/* table + cups */}
      <g stroke={DARK} strokeWidth="2">
        <rect x="123" y="90" width="7" height="32" fill={WOOD} />
        <ellipse cx="126" cy="123" rx="14" ry="3" fill={WOOD} />
        <ellipse cx="126" cy="88" rx="34" ry="7" fill={WOOD} />
      </g>
      <Cup x={102} y={74} />
      <Cup x={136} y={74} />
      <Steam x={107} y={70} />
      <Steam x={141} y={70} />
    </>
  );
}

function PoolScene() {
  return (
    <>
      {/* umbrella */}
      <g stroke={DARK} strokeWidth="2" strokeLinejoin="round">
        <line x1="168" y1="34" x2="156" y2="128" strokeLinecap="round" />
        <path d="M130 40 Q168 0 206 40 Z" fill="#f5c242" />
        <path d="M155 37 Q168 6 181 37 Z" fill="#fff" />
      </g>
      {/* water, back */}
      <path
        d="M0 96 q12 -5 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V140 H0 Z"
        fill={WATER}
      />
      {/* frog in a ring, bobbing */}
      <g className="bob">
        <g transform="translate(30 16) scale(0.75)">
          <FrogFigure mood="chill" />
          <ellipse cx="60" cy="96" rx="46" ry="13" fill="none" stroke="#f87171" strokeWidth="11" />
          <ellipse
            cx="60"
            cy="96"
            rx="46"
            ry="13"
            fill="none"
            stroke="#fff"
            strokeWidth="11"
            strokeDasharray="14 22"
          />
        </g>
      </g>
      {/* water, front: covers the bottom of the ring */}
      <path
        d="M0 106 q12 -4 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 V140 H0 Z"
        fill={WATER}
        opacity="0.9"
      />
    </>
  );
}

function TangledScene() {
  return (
    <>
      {/* empty wall socket, right */}
      <g stroke={DARK} strokeWidth="2">
        <rect x="160" y="52" width="26" height="34" rx="5" fill="#fff" />
        <line x1="168" y1="64" x2="168" y2="72" strokeLinecap="round" />
        <line x1="178" y1="64" x2="178" y2="72" strokeLinecap="round" />
      </g>
      <g transform="translate(26 14) scale(0.85)">
        <FrogFigure mood="confused" />
        {/* cord wound around the body, trailing to the plug in its hand */}
        <g fill="none" stroke={CORD} strokeWidth="3.5" strokeLinecap="round">
          <ellipse cx="60" cy="76" rx="38" ry="9" transform="rotate(-12 60 76)" />
          <ellipse cx="60" cy="90" rx="36" ry="8" transform="rotate(10 60 90)" />
          <ellipse cx="60" cy="52" rx="40" ry="8" transform="rotate(6 60 52)" />
          <path d="M22 96 q-14 18 6 22 q30 6 50 -6 q20 -12 26 -16" />
        </g>
        {/* plug */}
        <g transform="translate(104 90) rotate(-30)" stroke={DARK} strokeWidth="1.5">
          <rect x="0" y="-6" width="14" height="12" rx="2" fill="#e5e7eb" />
          <line x1="14" y1="-3" x2="20" y2="-3" strokeWidth="2" />
          <line x1="14" y1="3" x2="20" y2="3" strokeWidth="2" />
        </g>
      </g>
    </>
  );
}

const SCENES = { tea: TeaScene, pool: PoolScene, tangled: TangledScene };

/**
 * Centered illustration with an optional caption below it.
 * @param {{
 *   scene: keyof typeof SCENES,
 *   children?: import('react').ReactNode,   caption
 *   className?: string,
 *   width?: number,                         illustration width in px (default 200)
 * }} props
 * @returns {import('react').JSX.Element}
 */
export default function FrogScene({ scene, children, className = '', width = 200 }) {
  const Scene = SCENES[scene];
  return (
    <div className={`flex flex-col items-center py-4 text-center ${className}`}>
      <svg viewBox="0 0 210 130" width={width} className="max-w-full" aria-hidden="true">
        <Scene />
      </svg>
      {children && <div className="mt-2 text-sm text-neutral-500">{children}</div>}
    </div>
  );
}

/**
 * Shaggy pom-pom centred on (0,0): a ring of cel-shaded strands around a core,
 * with one ink outline around the whole puff.
 * @param {{ delay?: string }} props
 */
function PomPom({ delay = '0ms' }) {
  const strands = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    return { x: Math.cos(a) * 14, y: Math.sin(a) * 14 };
  });
  return (
    <g className="pom-shake" style={{ animationDelay: delay }}>
      <g fill={DARK} stroke={DARK} strokeWidth={INK * 2}>
        {strands.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="9" />
        ))}
      </g>
      {strands.map((p, i) => (
        <CelEllipse
          key={i}
          cx={p.x}
          cy={p.y}
          rx={9}
          ry={9}
          base={GOLD}
          shade={GOLD_SHADE}
          outline={false}
        />
      ))}
      <CelEllipse cx={0} cy={0} rx={14} ry={14} base={GOLD} shade={GOLD_SHADE} outline={false} />
      <ellipse cx="-5" cy="-6" rx="4" ry="2" fill="#fde68a" transform="rotate(-30 -5 -6)" />
    </g>
  );
}

/**
 * Small frog shaking two pom-poms, for whoever is in last place.
 * @param {{ size?: number }} props
 * @returns {import('react').JSX.Element}
 */
export function PomPomFrog({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
      role="img"
      aria-label="Frog cheering you on with pom-poms"
    >
      <FrogFigure mood="cheer" />
      <g transform="translate(12 32)">
        <PomPom />
      </g>
      <g transform="translate(108 32)">
        <PomPom delay="-175ms" />
      </g>
    </svg>
  );
}

/**
 * Tiny frog hanging off the bottom edge of its parent by its fingertips, legs
 * kicking. Put it inside a `relative` element; it dangles below that element.
 * @param {{ className?: string }} props
 * @returns {import('react').JSX.Element}
 */
export function HangingFrog({ className = '' }) {
  const ink = 0.9; // outline width for this small 30x36 drawing
  return (
    <svg
      viewBox="0 0 30 36"
      width="34"
      height="40"
      className={`dangle pointer-events-none absolute -bottom-[37px] z-10 ${className}`}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* legs, kicking */}
      <Limb className="kick-l" d="M12 26 L9 33" width={3} ink={ink} />
      <Limb className="kick-r" d="M18 26 L21 33" width={3} ink={ink} />
      {/* arms up to the fingertips on the edge */}
      <Limb d="M8 2 L10 13" width={3} ink={ink} />
      <Limb d="M22 2 L20 13" width={3} ink={ink} />
      <CelEllipse cx={8} cy={2} rx={2.2} ry={2.2} ink={ink} />
      <CelEllipse cx={22} cy={2} rx={2.2} ry={2.2} ink={ink} />
      {/* body + head */}
      <CelEllipse cx={15} cy={22} rx={6} ry={6} ink={ink} />
      <CelEllipse
        cx={15}
        cy={23}
        rx={3.5}
        ry={3.5}
        base={BELLY}
        shade={BELLY_SHADE}
        outline={false}
      />
      <FrogHead
        cx={15}
        cy={15}
        rx={7.5}
        ry={5.5}
        ink={ink}
        eyes={[
          { cx: 11.5, cy: 10.5, r: 3 },
          { cx: 18.5, cy: 10.5, r: 3 },
        ]}
      />
      {/* looking up at the edge */}
      <FrogIris cx={11.5} cy={9.7} r={1.6} />
      <FrogIris cx={18.5} cy={9.7} r={1.6} />
      <FrogMouth cx={15} cy={15} rx={7.5} ry={5.5} width={0.8} />
    </svg>
  );
}

/**
 * Bodyguard frog in sunglasses. Salutes whenever `saluteKey` changes (e.g. every
 * time the check-in QR refreshes).
 * @param {{ saluteKey: number | string, size?: number, className?: string }} props
 * @returns {import('react').JSX.Element}
 */
export function GuardFrog({ saluteKey, size = 64, className = '' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible' }}
      role="img"
      aria-label="Frog in sunglasses guarding the QR code"
    >
      <FrogFigure mood="guard" />
      {/* sunglasses */}
      <g fill="#111">
        <rect x="29" y="21" width="26" height="16" rx="6" />
        <rect x="65" y="21" width="26" height="16" rx="6" />
        <rect x="53" y="25" width="14" height="4" rx="2" />
      </g>
      <path d="M34 26 L42 26" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M70 26 L78 26" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* right arm: at its side, then snaps up to the brow. Remounts to replay. */}
      <g key={saluteKey} strokeLinejoin="round">
        <Limb className="salute-rest" d="M90 78 L102 94" />
        <Limb className="salute-up" d="M88 76 L114 52 L88 16 L72 17" />
      </g>
    </svg>
  );
}
