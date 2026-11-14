/**
 * PLACEHOLDER MASCOT: designer, replace the SVG art in this one file.
 * Keep the props the same so nothing else has to change.
 *
 * @param {{ mood?: 'happy' | 'cheer' | 'wave', size?: number, className?: string }} props
 */
export default function FrogMascot({ mood = 'happy', size = 120, className = '' }) {
  const body = '#3a9a4b';
  const belly = '#bbe3c1';
  const dark = '#1c4825';

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Frog mascot (${mood})`}
    >
      {/* arms (behind body) */}
      {mood === 'cheer' && (
        <>
          <path d="M30 72 L14 40" stroke={body} strokeWidth="10" strokeLinecap="round" />
          <path d="M90 72 L106 40" stroke={body} strokeWidth="10" strokeLinecap="round" />
        </>
      )}
      {mood === 'wave' && (
        <>
          <path d="M30 78 L18 94" stroke={body} strokeWidth="10" strokeLinecap="round" />
          <path d="M90 72 L108 46" stroke={body} strokeWidth="10" strokeLinecap="round">
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
      {mood === 'happy' && (
        <>
          <path d="M30 78 L18 94" stroke={body} strokeWidth="10" strokeLinecap="round" />
          <path d="M90 78 L102 94" stroke={body} strokeWidth="10" strokeLinecap="round" />
        </>
      )}

      {/* body + belly */}
      <ellipse cx="60" cy="78" rx="34" ry="30" fill={body} />
      <ellipse cx="60" cy="86" rx="20" ry="17" fill={belly} />

      {/* head + eyes */}
      <ellipse cx="60" cy="50" rx="36" ry="24" fill={body} />
      <circle cx="42" cy="30" r="12" fill={body} />
      <circle cx="78" cy="30" r="12" fill={body} />
      <circle cx="42" cy="30" r="8" fill="#fff" />
      <circle cx="78" cy="30" r="8" fill="#fff" />
      <circle cx="43" cy="31" r="4" fill={dark} />
      <circle cx="79" cy="31" r="4" fill={dark} />

      {/* mouth */}
      {mood === 'cheer' ? (
        <path d="M46 52 Q60 70 74 52 Z" fill={dark} />
      ) : (
        <path
          d="M46 54 Q60 64 74 54"
          stroke={dark}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* cheeks */}
      <circle cx="34" cy="56" r="4" fill="#f9a8b8" opacity="0.7" />
      <circle cx="86" cy="56" r="4" fill="#f9a8b8" opacity="0.7" />
    </svg>
  );
}
