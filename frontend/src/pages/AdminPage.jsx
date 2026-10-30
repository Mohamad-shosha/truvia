import { useCallback, useEffect, useState } from 'react';
import { adminCreateUser, adminListUsers, adminResetPassword } from '../services/adminService';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import TextField from '../components/TextField';
import { LockIcon, MailIcon, UserIcon } from '../components/icons';
import {
  hasErrors,
  validateEmail,
  validateFullName,
  validateNewPassword,
  validateRequired,
} from '../utils/validation';

const AVAILABLE_ROLES = [
  { value: 'ROLE_GRC_ANALYST', label: 'GRC Analyst' },
  { value: 'ROLE_SOC_ANALYST', label: 'SOC Analyst' },
  { value: 'ROLE_CISO', label: 'CISO' },
  { value: 'ROLE_PENTESTER', label: 'Penetration Tester' },
  { value: 'ROLE_ADMIN', label: 'Administrator' },
];

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrator',
  ROLE_CISO: 'CISO',
  ROLE_GRC_ANALYST: 'GRC Analyst',
  ROLE_SOC_ANALYST: 'SOC Analyst',
  ROLE_PENTESTER: 'Penetration Tester',
};

export default function AdminPage() {
  const [usersState, setUsersState] = useState({ status: 'loading', users: [], error: '' });

  // Create User Form State
  const [createValues, setCreateValues] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ROLE_GRC_ANALYST',
  });
  const [createTouched, setCreateTouched] = useState({});
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');

  // Reset Password Modal State
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetTouched, setResetTouched] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const loadUsers = useCallback(() => {
    let active = true;
    adminListUsers()
      .then((users) => active && setUsersState({ status: 'ready', users, error: '' }))
      .catch((err) => active && setUsersState({ status: 'error', users: [], error: err.message }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Create User Validation
  const createErrors = {
    fullName: validateFullName(createValues.fullName),
    email: validateEmail(createValues.email),
    password: validateNewPassword(createValues.password),
    role: validateRequired(createValues.role, 'Role'),
  };
  const createVisible = (field) => (createTouched[field] ? createErrors[field] : '');

  const setCreateField = (field) => (e) => {
    setCreateValues((v) => ({ ...v, [field]: e.target.value }));
    setCreateSuccess('');
    setCreateError('');
  };

  const blurCreate = (field) => () => {
    setCreateTouched((t) => ({ ...t, [field]: true }));
  };

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreateTouched({ fullName: true, email: true, password: true, role: true });
    setCreateSuccess('');
    setCreateError('');

    if (hasErrors(createErrors)) return;

    setCreateSubmitting(true);
    try {
      const created = await adminCreateUser({
        fullName: createValues.fullName.trim(),
        email: createValues.email.trim(),
        password: createValues.password,
        role: createValues.role,
      });
      setCreateSuccess(`Account created successfully for ${created.fullName} (${created.email}).`);
      setCreateValues({ fullName: '', email: '', password: '', role: 'ROLE_GRC_ANALYST' });
      setCreateTouched({});
      loadUsers();
    } catch (err) {
      if (err.status === 409) {
        setCreateError('An account with this email address already exists.');
      } else {
        setCreateError(err.message || 'Failed to create account.');
      }
    } finally {
      setCreateSubmitting(false);
    }
  }

  // Reset Password Logic
  const resetErrorMsg = resetTouched ? validateNewPassword(resetPasswordValue) : '';

  async function handleResetPassword(e) {
    e.preventDefault();
    setResetTouched(true);
    setResetError('');
    if (validateNewPassword(resetPasswordValue)) return;

    setResetSubmitting(true);
    try {
      await adminResetPassword(resetTargetUser.id, resetPasswordValue);
      setResetSuccess(`Password for ${resetTargetUser.fullName} was reset successfully.`);
      setResetTargetUser(null);
      setResetPasswordValue('');
      setResetTouched(false);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetSubmitting(false);
    }
  }

  return (
    <section className="page" aria-labelledby="admin-title" style={{ maxWidth: '980px' }}>
      <header>
        <h1 id="admin-title" className="page__title">
          Administration &amp; User Provisioning
        </h1>
        <p className="muted" style={{ marginTop: '4px' }}>
          Create employee accounts, assign roles, and manage credentials across the company.
        </p>
      </header>

      {resetSuccess && (
        <Alert variant="success" onClose={() => setResetSuccess('')}>
          {resetSuccess}
        </Alert>
      )}

      {/* User Creation Section */}
      <div className="card">
        <h2 className="card__title">Create Company Account</h2>
        <p className="muted" style={{ fontSize: '0.88rem', marginTop: '4px' }}>
          Employees do not self-register. Set up their initial credentials and designated role here.
        </p>

        <div className="stack" style={{ marginTop: '16px' }}>
          {createSuccess && <Alert variant="success">{createSuccess}</Alert>}
          {createError && <Alert id="create-user-error">{createError}</Alert>}
        </div>

        <form onSubmit={handleCreateUser} noValidate className="form" style={{ marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <TextField
              label="Full Name"
              name="fullName"
              placeholder="e.g. Jane Doe"
              value={createValues.fullName}
              onChange={setCreateField('fullName')}
              onBlur={blurCreate('fullName')}
              error={createVisible('fullName')}
              icon={<UserIcon />}
              disabled={createSubmitting}
            />
            <TextField
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. jane.doe@company.com"
              value={createValues.email}
              onChange={setCreateField('email')}
              onBlur={blurCreate('email')}
              error={createVisible('email')}
              icon={<MailIcon />}
              disabled={createSubmitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <TextField
              label="Initial Password"
              name="password"
              type="password"
              placeholder="Create strong initial password"
              hint="10–64 characters with at least one letter and one digit."
              value={createValues.password}
              onChange={setCreateField('password')}
              onBlur={blurCreate('password')}
              error={createVisible('password')}
              icon={<LockIcon />}
              disabled={createSubmitting}
            />

            <div className="field">
              <label htmlFor="user-role-select" className="field__label">
                Company Role
              </label>
              <select
                id="user-role-select"
                className="select-input"
                value={createValues.role}
                onChange={setCreateField('role')}
                disabled={createSubmitting}
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <Button id="create-user-submit" type="submit" loading={createSubmitting} style={{ width: 'auto', minWidth: '200px' }}>
              {createSubmitting ? 'Creating Account…' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>

      {/* User Directory Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card__title">Company Directory</h2>
            <p className="muted" style={{ fontSize: '0.88rem', marginTop: '4px' }}>
              All active employee accounts and their risk roles.
            </p>
          </div>
          <Button variant="ghost" onClick={loadUsers} style={{ fontSize: '0.85rem' }}>
            Refresh List
          </Button>
        </div>

        {usersState.status === 'loading' && (
          <div className="card--center" style={{ minHeight: '120px' }}>
            <Spinner size={24} label="Loading users" />
          </div>
        )}

        {usersState.status === 'error' && (
          <div className="stack" style={{ marginTop: '16px' }}>
            <Alert>{usersState.error}</Alert>
            <Button variant="secondary" onClick={loadUsers}>
              Retry
            </Button>
          </div>
        )}

        {usersState.status === 'ready' && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersState.users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.fullName}</strong>
                    </td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <div className="badges">
                        {u.roles.map((r) => (
                          <span key={r} className="badge">
                            {ROLE_LABELS[r] || r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: u.enabled ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        style={{ minHeight: '34px', padding: '0 12px', fontSize: '0.82rem' }}
                        onClick={() => {
                          setResetTargetUser(u);
                          setResetPasswordValue('');
                          setResetTouched(false);
                          setResetError('');
                        }}
                      >
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
          <div className="modal-card">
            <div className="modal-card__header">
              <h2 id="reset-modal-title" className="card__title">
                Reset Password
              </h2>
              <button
                type="button"
                className="link-btn"
                style={{ fontSize: '1.2rem', textDecoration: 'none' }}
                onClick={() => setResetTargetUser(null)}
              >
                &times;
              </button>
            </div>

            <p className="muted" style={{ fontSize: '0.88rem' }}>
              Enter a new temporary or permanent password for <strong>{resetTargetUser.fullName}</strong> (
              {resetTargetUser.email}).
            </p>

            {resetError && (
              <div style={{ marginTop: '12px' }}>
                <Alert>{resetError}</Alert>
              </div>
            )}

            <form onSubmit={handleResetPassword} noValidate className="form">
              <TextField
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                hint="10–64 characters with at least one letter and one digit."
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                onBlur={() => setResetTouched(true)}
                error={resetErrorMsg}
                icon={<LockIcon />}
                disabled={resetSubmitting}
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={resetSubmitting}
                  onClick={() => setResetTargetUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={resetSubmitting}>
                  {resetSubmitting ? 'Resetting…' : 'Set New Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
