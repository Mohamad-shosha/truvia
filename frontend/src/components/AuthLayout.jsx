import { Link } from "react-router-dom";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

function OverviewIcon() {
  return (
    <svg viewBox="0 0 42 42" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="1" />
      <rect x="23" y="8" width="11" height="11" rx="1" />
      <rect x="8" y="23" width="11" height="11" rx="1" />
      <rect x="23" y="23" width="11" height="11" rx="1" />
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="13" />
      <circle cx="21" cy="21" r="7" />
      <circle cx="21" cy="21" r="2" />
    </svg>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link className="auth-header__brand" to="/" aria-label="TRUVIA home">
          <Logo size={24} />
        </Link>
        <div className="auth-header__tools">
          <span>Employee workspace</span>
          <ThemeToggle className="auth-theme-toggle" />
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-hero" aria-labelledby="auth-hero-title">
          <p className="auth-kicker">CYBER RISK. CONNECTED.</p>
          <h1 id="auth-hero-title" className="auth-hero__title">
            Secure access.
            <span>Clearer risk insight.</span>
          </h1>
          <p className="auth-hero__lead">
            Access your TRUVIA workspace to connect assets, risk and
            compliance—and focus on what matters next.
          </p>

          <div className="auth-benefits">
            <article className="auth-benefit">
              <span className="auth-benefit__icon"><OverviewIcon /></span>
              <div>
                <h2>See the bigger picture</h2>
                <p>Bring your security priorities into one clear view.</p>
              </div>
            </article>
            <article className="auth-benefit">
              <span className="auth-benefit__icon"><FocusIcon /></span>
              <div>
                <h2>Turn insight into focus</h2>
                <p>Connect the context. Know what to work on next.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="auth-card" aria-label="Authentication">
          {children}
        </section>
      </main>
    </div>
  );
}
