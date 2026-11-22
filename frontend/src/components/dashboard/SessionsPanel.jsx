import { useCallback, useEffect, useState } from 'react';
import { listSessions, revokeOtherSessions, revokeSession } from '../../services/dashboardService';
import Alert from '../Alert';
import Button from '../Button';
import Spinner from '../Spinner';
import { DeviceIcon } from '../icons';
import { Panel } from './Widgets';
import { formatDateTime, formatRelative } from '../../utils/format';

/** The signed-in user's active sessions, with per-session and "everywhere else" sign-out. */
export default function SessionsPanel({ onChange }) {
  const [state, setState] = useState({ status: 'loading', sessions: [], error: '' });
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const sessions = await listSessions();
      setState({ status: 'ready', sessions, error: '' });
    } catch (err) {
      setState({ status: 'error', sessions: [], error: err.message || 'Could not load your sessions.' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(key, action, message) {
    setBusy(key);
    setNotice('');
    try {
      await action();
      setNotice(message);
      await load();
      onChange?.();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message || 'The session could not be signed out.' }));
    } finally {
      setBusy(null);
    }
  }

  const others = state.sessions.filter((s) => !s.current);

  return (
    <Panel
      id="sessions"
      title="Active sessions"
      subtitle="Every place your account is signed in. Sign out anything you don't recognise."
      action={
        others.length > 0 && (
          <Button
            id="revoke-others"
            variant="secondary"
            className="btn btn--secondary btn--sm"
            loading={busy === 'others'}
            disabled={busy !== null}
            onClick={() =>
              run('others', revokeOtherSessions, `Signed out of ${others.length} other session${others.length > 1 ? 's' : ''}.`)
            }
          >
            Sign out all others
          </Button>
        )
      }
    >
      {notice && <Alert variant="success">{notice}</Alert>}
      {state.error && state.status === 'ready' && <Alert>{state.error}</Alert>}
      {state.status === 'loading' && (
        <div className="card--center panel__loading">
          <Spinner size={22} label="Loading sessions" />
        </div>
      )}
      {state.status === 'error' && (
        <div className="stack">
          <Alert>{state.error}</Alert>
          <Button variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      )}
      {state.status === 'ready' && (
        <ul className="sessions">
          {state.sessions.map((s) => (
            <li key={s.id} className="sessions__row" data-current={s.current || undefined}>
              <span className="sessions__icon" aria-hidden="true">
                <DeviceIcon />
              </span>
              <span className="sessions__main">
                <strong>
                  {s.current ? 'This browser' : 'Another sign-in'}
                  {s.current && <span className="pill pill--ok">Current</span>}
                </strong>
                <span className="muted">
                  Signed in {formatDateTime(s.startedAt)} · active {formatRelative(s.lastActiveAt)}
                  {s.rememberMe ? ' · remembered for 30 days' : ''}
                </span>
              </span>
              {!s.current && (
                <Button
                  variant="ghost"
                  className="btn btn--ghost btn--sm"
                  loading={busy === s.id}
                  disabled={busy !== null}
                  aria-label={`Sign out session started ${formatDateTime(s.startedAt)}`}
                  onClick={() => run(s.id, () => revokeSession(s.id), 'Session signed out.')}
                >
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
