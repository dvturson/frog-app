/**
 * Rounded speech-bubble icon (24px stroke style, matches BottomNav). Inherits text color.
 * @param {{ className?: string }} props
 * @returns {import('react').JSX.Element}
 */
export default function ChatBubbleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4c4.97 0 9 3.13 9 7s-4.03 7-9 7c-1.03 0-2.02-.13-2.94-.38L4 20l1.4-3.6C3.9 15.1 3 13.13 3 11c0-3.87 4.03-7 9-7z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth="2.5" />
    </svg>
  );
}
