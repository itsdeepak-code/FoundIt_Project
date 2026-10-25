import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '../components/ui/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Only logged-in users can see these pages; others are sent to /login and returned afterwards. */
export function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <LoadingState label="Checking your session…" />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

/**
 * Login / register pages. Once the user is logged in they are sent back to the page
 * they originally wanted (saved by ProtectedRoute), or to the dashboard.
 */
export function GuestRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <LoadingState />;
  if (user) return <Navigate to={location.state?.from || '/dashboard'} replace />;
  return <Outlet />;
}
