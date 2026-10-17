import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from '../components/Spinner';
import ForbiddenPage from '../pages/ForbiddenPage';

/**
 * Route guard (UX only; the backend remains authoritative).
 * - While the session is being restored nothing protected is rendered.
 * - `roles`: user needs at least one of them, otherwise a Forbidden screen is shown (no redirect => no loop).
 */
export function ProtectedRoute({ roles }) {
  const { status, user, sessionExpired } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner label="Restoring your session" />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location, expired: sessionExpired }} />;
  }
  if (roles?.length && !roles.some((r) => user.roles.includes(r))) {
    return <ForbiddenPage />;
  }
  return <Outlet />;
}

/** Login/Register are not shown to signed-in users. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullPageSpinner label="Loading" />;
  if (status === 'authenticated') {
    const target = location.state?.from?.pathname || '/profile';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
