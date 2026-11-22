import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { BellIcon, ChecklistIcon, GridIcon, LogoutIcon, SearchIcon, ShieldIcon, SparkIcon, UserIcon, UsersIcon, WarningIcon, PulseIcon } from './icons';
import { roleLabel } from '../utils/format';
import { RISK_READ_ROLES } from '../services/riskService';

const RISK_ROLES = RISK_READ_ROLES;

/**
 * Sidebar entries. `roles` (any of) restricts visibility; `soon` renders a disabled entry with its roadmap phase.
 * The backend stays authoritative for every permission.
 */
const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/dashboard', id: 'nav-dashboard', label: 'Dashboard', icon: GridIcon },
      { to: '/risks', id: 'nav-risks', label: 'Risks', icon: WarningIcon, roles: RISK_ROLES },
      { id: 'nav-controls', label: 'Controls', icon: ShieldIcon, soon: 'Phase 5', roles: ['ROLE_ADMIN', 'ROLE_CISO', 'ROLE_GRC_ANALYST'] },
      { id: 'nav-compliance', label: 'Compliance', icon: ChecklistIcon, soon: 'Phase 5', roles: ['ROLE_ADMIN', 'ROLE_CISO', 'ROLE_GRC_ANALYST'] },
      { id: 'nav-incidents', label: 'Incidents', icon: PulseIcon, soon: 'Phase 6', roles: ['ROLE_ADMIN', 'ROLE_CISO', 'ROLE_SOC_ANALYST'] },
    ],
  },
  {
    section: 'Administration',
    roles: ['ROLE_ADMIN'],
    items: [{ to: '/admin', id: 'nav-admin', label: 'Users & access', icon: UsersIcon }],
  },
];

export default function AppShell() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const canSearch = hasRole(...RISK_ROLES);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  async function handleLogout() {
    setSigningOut(true);
    const { serverRevoked } = await logout();
    navigate('/login', { replace: true, state: { loggedOut: true, serverRevoked } });
  }

  function search(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/risks?q=${encodeURIComponent(q)}&status=ALL` : '/risks');
  }

  const visible = (entry) => !entry.roles || hasRole(...entry.roles);

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

        <div className="shell__collapsible" id="primary-nav">
          <nav aria-label="Primary" className="shell__nav">
            {NAV.filter(visible).map((group) => (
              <div key={group.section} className="shell__group">
                <span className="shell__section">{group.section}</span>
                {group.items.filter(visible).map(({ to, id, label, icon: Icon, soon }) =>
                  soon ? (
                    <span key={id} id={id} className="shell__link is-disabled" aria-disabled="true" title={`${label} arrives with ${soon}`}>
                      <Icon width={18} height={18} />
                      {label}
                      <span className="shell__soon">Soon</span>
                    </span>
                  ) : (
                    <NavLink key={to} to={to} id={id} className="shell__link">
                      <Icon width={18} height={18} />
                      {label}
                    </NavLink>
                  ),
                )}
              </div>
            ))}
          </nav>

          <div className="ai-card" aria-label="AI TRUVIA assistant">
            <div className="ai-card__head">
              <SparkIcon width={16} height={16} />
              <strong>AI TRUVIA</strong>
            </div>
            <span className="ai-card__status">
              <span className="ai-card__dot" aria-hidden="true" /> Coming in Phase 7
            </span>
            <p>Your AI assistant for risk questions, remediation playbooks and quick answers.</p>
          </div>

          <div className="shell__bottom">
            <NavLink to="/profile" id="nav-profile" className="shell__link">
              <UserIcon width={18} height={18} />
              Profile &amp; security
            </NavLink>
            <button type="button" id="logout-button" className="shell__link shell__logout" onClick={handleLogout} disabled={signingOut}>
              <LogoutIcon width={18} height={18} />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      <div className="shell__body">
        <header className="shell__top">
          {canSearch ? (
            <form className="topsearch" role="search" onSubmit={search}>
              <SearchIcon width={16} height={16} />
              <input
                type="search"
                className="topsearch__input"
                placeholder="Search risks…"
                aria-label="Search risks"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          ) : (
            <span />
          )}
          <div className="shell__tools">
            <ThemeToggle />
            <span className="icon-btn is-disabled" role="img" aria-label="Notifications arrive with Phase 6" title="Notifications arrive with Phase 6">
              <BellIcon width={18} height={18} />
            </span>
            <NavLink to="/profile" className="avatar-link" title={`${user.fullName} · ${user.roles.map(roleLabel).join(', ')}`}>
              <span className="people__avatar" aria-hidden="true">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
              <span className="sr-only">Your profile</span>
            </NavLink>
          </div>
        </header>
        <main className="shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
