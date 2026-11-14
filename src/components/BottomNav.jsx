import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth/useAuth';

/** Simple 24px stroke icons. Swap for a designer icon set later. */
const ICONS = {
  path: 'M4 20c4-2 4-6 8-8s4-6 8-8M6 20h.01M18 4h.01',
  events: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  leaderboard: 'M6 20V10M12 20V4M18 20v-7',
  chat: 'M4 5h16v11H8l-4 4z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  frog: 'M14 4l6 6-9 9H5v-6zM12 6l6 6',
};

/** @param {{ name: keyof typeof ICONS }} props */
function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Bottom tab bar. FROGs get an extra "FROG Tools" tab. */
export default function BottomNav() {
  const { profile } = useAuth();

  const tabs = [
    { to: '/', label: 'Path', icon: 'path', end: true },
    { to: '/events', label: 'Events', icon: 'events' },
    { to: '/leaderboard', label: 'Ranks', icon: 'leaderboard' },
    { to: '/chat', label: 'Chat', icon: 'chat' },
    { to: '/profile', label: 'Profile', icon: 'profile' },
  ];
  if (profile?.role === 'frog')
    tabs.splice(1, 0, { to: '/frog', label: 'FROG Tools', icon: 'frog' });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[390px] border-t border-frog-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="flex">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  isActive ? 'text-frog-700' : 'text-neutral-400 hover:text-frog-600'
                }`
              }
            >
              <Icon name={t.icon} />
              <span className="leading-none">{t.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
