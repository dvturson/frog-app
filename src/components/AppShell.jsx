import { Outlet } from 'react-router-dom';
import { useAuth, APP_ROLES } from '../lib/auth/useAuth';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

/**
 * Phone-width column (390px) centered on desktop. Shows TopBar + BottomNav
 * only for signed-in users with a valid role.
 */
export default function AppShell() {
  const { profile } = useAuth();
  const signedIn = Boolean(profile && APP_ROLES.includes(profile.role));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-white shadow-sm">
      {signedIn && <TopBar />}
      <main className={`flex-1 ${signedIn ? 'pb-20' : ''}`}>
        <Outlet />
      </main>
      {signedIn && <BottomNav />}
    </div>
  );
}
