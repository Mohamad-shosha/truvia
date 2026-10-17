// Client-side validation mirrors the backend rules for fast feedback.
// The backend remains authoritative.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateFullName(value) {
  const v = (value ?? '').trim();
  if (!v) return 'Full name is required';
  if (v.length < 2) return 'Full name must be at least 2 characters';
  if (v.length > 120) return 'Full name must be at most 120 characters';
  return '';
}

export function validateEmail(value) {
  const v = (value ?? '').trim();
  if (!v) return 'Email is required';
  if (v.length > 254 || !EMAIL_RE.test(v)) return 'Enter a valid email address';
  return '';
}

export function validateNewPassword(value) {
  const v = value ?? '';
  if (!v) return 'Password is required';
  if (v.length < 10) return 'Password must be at least 10 characters';
  if (v.length > 64) return 'Password must be at most 64 characters';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Password must contain at least one letter and one digit';
  return '';
}

export function validateRequired(value, label) {
  return (value ?? '') === '' ? `${label} is required` : '';
}

export function validateConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password';
  return password === confirm ? '' : 'Passwords do not match';
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
