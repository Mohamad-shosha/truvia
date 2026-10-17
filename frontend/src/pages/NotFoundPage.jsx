import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="fullpage-center page--center">
      <p className="status-code">404</p>
      <h1 className="page__title">Page not found</h1>
      <Link to="/" className="btn btn--secondary">
        Go home
      </Link>
    </main>
  );
}
