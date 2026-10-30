import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { ArrowIcon, LockIcon, MailIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { hasErrors, validateEmail, validateRequired } from '../../utils/validation';

export default function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const location = useLocation();
  const state = location.state || {};

  const [values, setValues] = useState({ email: '', password: '', rememberMe: false });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = {
    email: validateEmail(values.email),
    password: validateRequired(values.password, 'Password'),
  };
  const visible = (f) => (touched[f] ? errors[f] : '');

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
  };
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setTouched({ email: true, password: true });
    setServerError('');
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password, rememberMe: values.rememberMe });
      // PublicOnlyRoute redirects once the session is established.
    } catch (err) {
      setServerError(
        err.status === 401
          ? 'Invalid email or password.'
          : err.status === 400
            ? 'Please check your details and try again.'
            : err.message,
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <header className="auth-card__head">
        <h1 className="auth-card__title">Log In</h1>
        <span className="auth-card__rule" />
        <h2 className="auth-card__welcome">Welcome Back</h2>
        <p className="auth-card__sub">Sign in to your TRUVIA account</p>
      </header>

      <div className="stack">
        {(state.expired || sessionExpired) && <Alert variant="warning">Your session has expired. Please sign in again.</Alert>}
        {state.loggedOut && !state.serverRevoked && (
          <Alert variant="warning">
            You were signed out on this device, but we could not confirm the server session was revoked.
          </Alert>
        )}
        {state.loggedOut && state.serverRevoked && <Alert variant="success">You have been signed out.</Alert>}
        {serverError && <Alert id="login-error">{serverError}</Alert>}
      </div>

      <form onSubmit={onSubmit} noValidate className="form" aria-label="Log in">
        <TextField
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email Address"
          value={values.email}
          onChange={set('email')}
          onBlur={blur('email')}
          error={visible('email')}
          icon={<MailIcon />}
          disabled={submitting}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter Password"
          value={values.password}
          onChange={set('password')}
          onBlur={blur('password')}
          error={visible('password')}
          icon={<LockIcon />}
          disabled={submitting}
        />

        <div className="form__row">
          <label className="check">
            <input type="checkbox" name="rememberMe" checked={values.rememberMe} onChange={set('rememberMe')} disabled={submitting} />
            <span>Remember me</span>
          </label>
        </div>

        <Button id="login-submit" type="submit" loading={submitting} icon={<ArrowIcon />}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <footer className="auth-card__foot">
        <span className="text-muted" style={{ fontSize: '0.82rem' }}>
          Account creation and password recovery are managed by your company administrator.
        </span>
      </footer>
    </AuthLayout>
  );
}
