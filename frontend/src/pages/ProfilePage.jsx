import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrator',
  ROLE_CISO: 'CISO',
  ROLE_GRC_ANALYST: 'GRC Analyst',
  ROLE_SOC_ANALYST: 'SOC Analyst',
  ROLE_PENTESTER: 'Penetration Tester',
};

export default function ProfilePage() {
  const [state, setState] = useState({ status: 'loading', profile: null, error: '' });

  const load = useCallback(() => {
    let active = true;
    setState({ status: 'loading', profile: null, error: '' });
    authService
      .getMe()
      .then((profile) => active && setState({ status: 'ready', profile, error: '' }))
      .catch((err) => active && setState({ status: 'error', profile: null, error: err.message }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  return (
    <section className="page" aria-labelledby="profile-title">
      <h1 id="profile-title" className="page__title">
        Your profile
      </h1>

      {state.status === 'loading' && (
        <div className="card card--center">
          <Spinner size={28} label="Loading profile" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="card stack">
          <Alert id="profile-error">{state.error}</Alert>
          <Button onClick={load} variant="secondary">
            Try again
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="card">
          <dl className="profile">
            <div>
              <dt>Full name</dt>
              <dd id="profile-name">{state.profile.fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd id="profile-email">{state.profile.email}</dd>
            </div>
            <div>
              <dt>Roles</dt>
              <dd id="profile-roles" className="badges">
                {state.profile.roles.map((r) => (
                  <span key={r} className="badge" title={r}>
                    {ROLE_LABELS[r] || r}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
