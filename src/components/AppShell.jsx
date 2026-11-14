import { useState, useSyncExternalStore } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth, APP_ROLES } from '../lib/auth/useAuth';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import PullToRefresh from './PullToRefresh';
import FrogScene from './FrogScene';

/** @param {() => void} cb */
function subscribeOnline(cb) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

/**
 * Phone-width column (390px) centered on desktop. Shows TopBar + BottomNav
 * only for signed-in users with a valid role. Signed-in pages get
 * pull-to-refresh (remounts the page so its hooks refetch) and an offline banner.
 * @returns {import('react').JSX.Element}
 */
export default function AppShell() {
  const { profile, refreshProfile } = useAuth();
  const signedIn = Boolean(profile && APP_ROLES.includes(profile.role));
  const [refreshKey, setRefreshKey] = useState(0);
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  function refresh() {
    refreshProfile();
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-white shadow-sm">
      {signedIn && <TopBar />}
      {signedIn && !online && (
        <FrogScene
          scene="tangled"
          width={140}
          className="border-b border-frog-100 bg-frog-50 !py-2"
        >
          You&apos;re offline. Things will update when you reconnect.
        </FrogScene>
      )}
      <main className={`flex-1 ${signedIn ? 'pb-20' : ''}`}>
        {signedIn ? (
          <PullToRefresh onRefresh={refresh}>
            <Outlet key={refreshKey} />
          </PullToRefresh>
        ) : (
          <Outlet />
        )}
      </main>
      {signedIn && <BottomNav />}
    </div>
  );
}
