import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

export default function AppShell() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    const { serverRevoked } = await logout();
    navigate('/login', { replace: true, state: { loggedOut: true, serverRevoked } });
  }

  return (
    <div className="shell">
      <header className="shell__header">
        <Logo size={32} />
        <nav aria-label="Primary" className="shell__nav">
          <NavLink to="/profile" id="nav-profile" className="shell__link">
            Profile
          </NavLink>
          {hasRole('ROLE_ADMIN') && (
            <NavLink to="/admin" id="nav-admin" className="shell__link">
              Administration
            </NavLink>
          )}
        </nav>
        <div className="shell__user">
          <ThemeToggle />
          <span className="shell__name" title={user.email}>
            {user.fullName}
          </span>
          <Button id="logout-button" variant="ghost" onClick={handleLogout} loading={signingOut}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  );
}
