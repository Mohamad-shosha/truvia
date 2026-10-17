import { useEffect, useState } from 'react';
import { adminPing } from '../services/adminService';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

/** Demonstrates backend-enforced RBAC: the server decides, the UI only reports the answer. */
export default function AdminPage() {
  const [state, setState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    let active = true;
    adminPing()
      .then(() => active && setState({ status: 'ok', message: '' }))
      .catch((err) => active && setState({ status: 'error', message: err.message }));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page" aria-labelledby="admin-title">
      <h1 id="admin-title" className="page__title">
        Administration
      </h1>
      <div className="card stack">
        <h2 className="card__title">Access control check</h2>
        {state.status === 'loading' && <Spinner label="Verifying access" />}
        {state.status === 'ok' && (
          <Alert variant="success" id="admin-ok">
            The server confirmed your ROLE_ADMIN access.
          </Alert>
        )}
        {state.status === 'error' && <Alert id="admin-error">{state.message}</Alert>}
      </div>
    </section>
  );
}
