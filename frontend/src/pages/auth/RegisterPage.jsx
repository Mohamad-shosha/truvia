import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { ArrowIcon, LockIcon, MailIcon, UserIcon } from '../../components/icons';
import { authService } from '../../services/authService';
import {
  hasErrors,
  validateConfirm,
  validateEmail,
  validateFullName,
  validateNewPassword,
} from '../../utils/validation';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = {
    fullName: validateFullName(values.fullName),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirm: validateConfirm(values.password, values.confirm),
  };
  const visible = (f) => (touched[f] ? errors[f] : '') || serverFieldErrors[f] || '';

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setServerFieldErrors((s) => ({ ...s, [field]: '' }));
  };
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setTouched({ fullName: true, email: true, password: true, confirm: true });
    setServerError('');
    setServerFieldErrors({});
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await authService.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      if (err.status === 409) {
        setServerFieldErrors({ email: 'An account with this email already exists.' });
      } else if (err.status === 400 && Object.keys(err.fieldErrors || {}).length) {
        setServerFieldErrors(err.fieldErrors);
        setServerError('Please fix the highlighted fields.');
      } else {
        setServerError(err.message);
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <header className="auth-card__head">
        <h1 className="auth-card__title">Sign Up</h1>
        <span className="auth-card__rule" />
        <h2 className="auth-card__welcome">Create your account</h2>
        <p className="auth-card__sub">Join TRUVIA to manage cyber risk with confidence</p>
      </header>

      <div className="stack">{serverError && <Alert id="register-error">{serverError}</Alert>}</div>

      <form onSubmit={onSubmit} noValidate className="form" aria-label="Create account">
        <TextField
          label="Full Name"
          name="fullName"
          autoComplete="name"
          placeholder="Full Name"
          value={values.fullName}
          onChange={set('fullName')}
          onBlur={blur('fullName')}
          error={visible('fullName')}
          icon={<UserIcon />}
          disabled={submitting}
          hideLabel={true}
        />
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
          hideLabel={true}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create Password"
          hint="10–64 characters with at least one letter and one digit."
          value={values.password}
          onChange={set('password')}
          onBlur={blur('password')}
          error={visible('password')}
          icon={<LockIcon />}
          disabled={submitting}
          hideLabel={true}
        />
        <TextField
          label="Confirm Password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm Password"
          value={values.confirm}
          onChange={set('confirm')}
          onBlur={blur('confirm')}
          error={visible('confirm')}
          icon={<LockIcon />}
          disabled={submitting}
          hideLabel={true}
        />

        <Button id="register-submit" type="submit" loading={submitting} icon={<ArrowIcon />}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <footer className="auth-card__foot">
        <span>Already have an Account</span>{' '}
        <Link to="/login" className="auth-card__link-accent">
          Log In
        </Link>
      </footer>
    </AuthLayout>
  );
}
