import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import TextField from '../components/TextField';
import { LockIcon } from '../components/icons';
import { hasErrors, validateConfirm, validateNewPassword, validateRequired } from '../utils/validation';

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrator',
  ROLE_CISO: 'CISO',
  ROLE_GRC_ANALYST: 'GRC Analyst',
  ROLE_SOC_ANALYST: 'SOC Analyst',
  ROLE_PENTESTER: 'Penetration Tester',
};

export default function ProfilePage() {
  const [profileState, setProfileState] = useState({ status: 'loading', profile: null, error: '' });

  // Password change state
  const [passValues, setPassValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passTouched, setPassTouched] = useState({});
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const load = useCallback(() => {
    let active = true;
    setProfileState({ status: 'loading', profile: null, error: '' });
    authService
      .getMe()
      .then((profile) => active && setProfileState({ status: 'ready', profile, error: '' }))
      .catch((err) => active && setProfileState({ status: 'error', profile: null, error: err.message }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  const passErrors = {
    currentPassword: validateRequired(passValues.currentPassword, 'Current password'),
    newPassword: validateNewPassword(passValues.newPassword),
    confirmPassword: validateConfirm(passValues.newPassword, passValues.confirmPassword),
  };
  const passVisible = (field) => (passTouched[field] ? passErrors[field] : '');

  const setPass = (field) => (e) => {
    setPassValues((v) => ({ ...v, [field]: e.target.value }));
    setPassSuccess('');
    setPassError('');
  };

  const blurPass = (field) => () => {
    setPassTouched((t) => ({ ...t, [field]: true }));
  };

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPassTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    setPassSuccess('');
    setPassError('');

    if (hasErrors(passErrors)) return;

    setPassSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: passValues.currentPassword,
        newPassword: passValues.newPassword,
      });
      setPassSuccess('Your password has been changed successfully. Keep it safe!');
      setPassValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassTouched({});
    } catch (err) {
      setPassError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPassSubmitting(false);
    }
  }

  return (
    <section className="page" aria-labelledby="profile-title">
      <h1 id="profile-title" className="page__title">
        Your profile
      </h1>

      {profileState.status === 'loading' && (
        <div className="card card--center">
          <Spinner size={28} label="Loading profile" />
        </div>
      )}

      {profileState.status === 'error' && (
        <div className="card stack">
          <Alert id="profile-error">{profileState.error}</Alert>
          <Button onClick={load} variant="secondary">
            Try again
          </Button>
        </div>
      )}

      {profileState.status === 'ready' && (
        <>
          <div className="card">
            <h2 className="card__title" style={{ marginBottom: '16px' }}>
              Profile Information
            </h2>
            <dl className="profile">
              <div>
                <dt>Full name</dt>
                <dd id="profile-name">{profileState.profile.fullName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd id="profile-email">{profileState.profile.email}</dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd id="profile-roles" className="badges">
                  {profileState.profile.roles.map((r) => (
                    <span key={r} className="badge" title={r}>
                      {ROLE_LABELS[r] || r}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h2 className="card__title">Security & Password</h2>
            <p className="muted" style={{ fontSize: '0.9rem', marginTop: '6px' }}>
              Change the initial password set by your administrator to your own private password.
            </p>

            <div className="stack" style={{ marginTop: '16px' }}>
              {passSuccess && <Alert variant="success">{passSuccess}</Alert>}
              {passError && <Alert id="change-pass-error">{passError}</Alert>}
            </div>

            <form onSubmit={handlePasswordChange} noValidate className="form" style={{ maxWidth: '440px' }}>
              <TextField
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passValues.currentPassword}
                onChange={setPass('currentPassword')}
                onBlur={blurPass('currentPassword')}
                error={passVisible('currentPassword')}
                icon={<LockIcon />}
                disabled={passSubmitting}
              />
              <TextField
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                hint="10–64 characters with at least one letter and one digit."
                value={passValues.newPassword}
                onChange={setPass('newPassword')}
                onBlur={blurPass('newPassword')}
                error={passVisible('newPassword')}
                icon={<LockIcon />}
                disabled={passSubmitting}
              />
              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passValues.confirmPassword}
                onChange={setPass('confirmPassword')}
                onBlur={blurPass('confirmPassword')}
                error={passVisible('confirmPassword')}
                icon={<LockIcon />}
                disabled={passSubmitting}
              />

              <Button type="submit" loading={passSubmitting} style={{ width: 'auto', minWidth: '180px' }}>
                {passSubmitting ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}
