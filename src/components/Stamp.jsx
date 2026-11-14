import { useEffect } from 'react';
import { shakeScreen } from '../lib/fx';

/**
 * Crooked rubber stamp that slams onto its (relative) parent and shakes the screen.
 * Place inside a `relative` container.
 * @param {{ label?: string, className?: string }} props
 * @returns {import('react').JSX.Element}
 */
export default function Stamp({ label = 'Checked in', className = '' }) {
  // Shake right as the stamp hits (matches the 300ms .stamp-slam animation).
  useEffect(() => shakeScreen(260), []);

  return (
    <div
      aria-hidden="true"
      className={`stamp-slam pointer-events-none absolute flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-double border-red-600/80 text-red-600/80 mix-blend-multiply ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 13l5 5L20 6" />
      </svg>
      <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
    </div>
  );
}
