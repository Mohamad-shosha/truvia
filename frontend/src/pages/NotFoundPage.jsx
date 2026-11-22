import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-page__theme">
        <ThemeToggle />
      </div>
      <section className="not-found-card">
        <p className="status-code">404</p>
        <h1 className="page__title">Page not found</h1>
        <Link to="/" className="btn btn--secondary">
          Go home
        </Link>
      </section>
    </main>
  );
}
