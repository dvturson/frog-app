import { RouterProvider } from 'react-router-dom';
import AuthProvider from './lib/auth/AuthProvider';
import { router } from './routes';

/** App root: auth context around the router. */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
