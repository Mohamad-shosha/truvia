import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import { GridIcon, UserIcon, UsersIcon } from './icons';
import { roleLabel } from '../utils/format';

/** Sidebar entries; `roles` (any of) restricts visibility. Backend authorization stays authoritative. */
const NAV = [
  { section: 'Workspace', items: [
    { to: '/dashboard', id: 'nav-dashboard', label: 'Dashboard', icon: GridIcon },
    { to: '/profile', id: 'nav-profile', label: 'Profile', icon: UserIcon },
  ] },
  { section: 'Administration', roles: ['ROLE_ADMIN'], items: [
    { to: '/admin', id: 'nav-admin', label: 'Users & access', icon: UsersIcon },
  ] },
];

export default function AppShell() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  async function handleLogout() {
    setSigningOut(true);
    const { serverRevoked } = await logout();
    navigate('/login', { replace: true, state: { loggedOut: true, serverRevoked } });
  }

  return (
    <div className="shell">
      <aside className={`shell__side${menuOpen ? ' is-open' : ''}`}>
        <div className="shell__brand">
          <Logo size={30} />
          <button
            type="button"
            className="icon-btn shell__menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
        <nav aria-label="Primary" className="shell__nav" id="primary-nav">
          {NAV.filter((g) => !g.roles || hasRole(...g.roles)).map((group) => (
            <div key={group.section} className="shell__group">
              <span className="shell__section">{group.section}</span>
              {group.items.map(({ to, id, label, icon: Icon }) => (
                <NavLink key={to} to={to} id={id} className="shell__link">
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="shell__account">
          <span className="people__avatar" aria-hidden="true">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <span className="shell__who">
            <span className="shell__name" title={user.email}>
              {user.fullName}
            </span>
            <span className="shell__role muted">{user.roles.map(roleLabel).join(', ')}</span>
          </span>
        </div>
      </aside>
      <div className="shell__body">
        <header className="shell__top">
          <ThemeToggle />
          <Button id="logout-button" variant="ghost" onClick={handleLogout} loading={signingOut}>
            Sign out
          </Button>
        </header>
        <main className="shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
