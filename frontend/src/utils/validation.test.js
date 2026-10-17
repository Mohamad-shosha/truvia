import { describe, expect, it } from 'vitest';
import {
  hasErrors,
  validateConfirm,
  validateEmail,
  validateFullName,
  validateNewPassword,
  validateRequired,
} from './validation';

describe('validation', () => {
  it('validates full name', () => {
    expect(validateFullName('')).toMatch(/required/i);
    expect(validateFullName('A')).toMatch(/at least 2/i);
    expect(validateFullName('Jane Doe')).toBe('');
  });

  it('validates email', () => {
    expect(validateEmail('')).toMatch(/required/i);
    expect(validateEmail('nope')).toMatch(/valid/i);
    expect(validateEmail('a@b')).toMatch(/valid/i);
    expect(validateEmail('jane@example.com')).toBe('');
  });

  it('enforces the password policy used by the backend', () => {
    expect(validateNewPassword('')).toMatch(/required/i);
    expect(validateNewPassword('short1')).toMatch(/at least 10/i);
    expect(validateNewPassword('onlyletterslong')).toMatch(/letter and one digit/i);
    expect(validateNewPassword('1234567890123')).toMatch(/letter and one digit/i);
    expect(validateNewPassword('x'.repeat(65) + '1')).toMatch(/at most 64/i);
    expect(validateNewPassword('Str0ng-Passphrase')).toBe('');
  });

  it('checks confirmation and required', () => {
    expect(validateConfirm('abc', '')).toMatch(/confirm/i);
    expect(validateConfirm('abc', 'abd')).toMatch(/do not match/i);
    expect(validateConfirm('abc', 'abc')).toBe('');
    expect(validateRequired('', 'Password')).toBe('Password is required');
    expect(hasErrors({ a: '', b: 'x' })).toBe(true);
    expect(hasErrors({ a: '' })).toBe(false);
  });
});
