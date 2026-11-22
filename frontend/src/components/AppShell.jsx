import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";

export default function AppShell() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);

    try {
      const { serverRevoked } = await logout();
      navigate("/login", {
        replace: true,
        state: { loggedOut: true, serverRevoked },
      });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar__logo">
          <Logo size={32} />
        </div>

        <nav aria-label="Main navigation" className="app-sidebar__nav">
          <NavLink to="/profile" className="app-sidebar__link">
            Profile
          </NavLink>

          {hasRole("ROLE_ADMIN") && (
            <NavLink to="/admin" className="app-sidebar__link">
              Administration
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <div className="app-topbar__user">
            <span className="app-topbar__name" title={user.email}>
              {user.fullName}
            </span>

            <ThemeToggle />

            <Button
              id="logout-button"
              variant="ghost"
              onClick={handleLogout}
              loading={signingOut}
            >
              Sign out
            </Button>
          </div>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
