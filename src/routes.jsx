import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/AppShell';
import RequireRole from './lib/auth/RequireRole';

import PathPage from './features/path/PathPage';
import LoginPage from './features/auth/LoginPage';
import EventsPage from './features/events/EventsPage';
import LeaderboardPage from './features/leaderboard/LeaderboardPage';
import ChatPage from './features/chat/ChatPage';
import ProfilePage from './features/profile/ProfilePage';
import FrogHomePage from './features/frog/FrogHomePage';
import AddEventPage from './features/frog/AddEventPage';
import EventQRPage from './features/frog/EventQRPage';
import AttendancePage from './features/frog/AttendancePage';
import OlympicsResultPage from './features/olympics/OlympicsResultPage';
import AdminPage from './features/admin/AdminPage';

// The QR scanner library is big, so only load it when a student opens /scan.
// eslint-disable-next-line react-refresh/only-export-components
const ScanPage = lazy(() => import('./features/checkin/ScanPage'));

/**
 * All routes. AppShell adds the TopBar + BottomNav when someone is signed in.
 *
 *  /                        Path (logged out: logo + Login; logged in: dashboard)
 *  /login                   Mock JMU SSO
 *  /events /leaderboard /chat /profile   Bottom tabs
 *  /scan                    Student QR scanner
 *  /frog/...                FROG Tools (frog only)
 *  /admin                   Admin roster upload (admin only)
 */
export const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      element: <AppShell />,
      children: [
        { path: '/', element: <PathPage /> },
        {
          path: '/events',
          element: (
            <RequireRole>
              <EventsPage />
            </RequireRole>
          ),
        },
        {
          path: '/leaderboard',
          element: (
            <RequireRole>
              <LeaderboardPage />
            </RequireRole>
          ),
        },
        {
          path: '/chat',
          element: (
            <RequireRole>
              <ChatPage />
            </RequireRole>
          ),
        },
        {
          path: '/profile',
          element: (
            <RequireRole>
              <ProfilePage />
            </RequireRole>
          ),
        },
        {
          path: '/scan',
          element: (
            <RequireRole roles={['freshman']}>
              <Suspense
                fallback={
                  <p className="p-6 text-center text-sm text-neutral-500">Loading scanner…</p>
                }
              >
                <ScanPage />
              </Suspense>
            </RequireRole>
          ),
        },

        {
          path: '/frog',
          element: (
            <RequireRole roles={['frog']}>
              <FrogHomePage />
            </RequireRole>
          ),
        },
        {
          path: '/frog/events/new',
          element: (
            <RequireRole roles={['frog']}>
              <AddEventPage />
            </RequireRole>
          ),
        },
        {
          path: '/frog/events/:eventId/qr',
          element: (
            <RequireRole roles={['frog']}>
              <EventQRPage />
            </RequireRole>
          ),
        },
        {
          path: '/frog/events/:eventId/attendance',
          element: (
            <RequireRole roles={['frog']}>
              <AttendancePage />
            </RequireRole>
          ),
        },
        {
          path: '/frog/olympics',
          element: (
            <RequireRole roles={['frog', 'admin']}>
              <OlympicsResultPage />
            </RequireRole>
          ),
        },

        {
          path: '/admin',
          element: (
            <RequireRole roles={['admin']}>
              <AdminPage />
            </RequireRole>
          ),
        },
        { path: '*', element: <PathPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
