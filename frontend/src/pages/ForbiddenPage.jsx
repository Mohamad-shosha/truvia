import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <section className="page page--center" aria-labelledby="forbidden-title">
      <p className="status-code">403</p>
      <h1 id="forbidden-title" className="page__title">
        Access denied
      </h1>
      <p className="muted">Your account does not have permission to view this page.</p>
      <Link to="/profile" className="btn btn--secondary">
        Back to profile
      </Link>
    </section>
  );
}
