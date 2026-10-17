import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: { register: vi.fn(), login: vi.fn(), getMe: vi.fn(), refresh: vi.fn(), logout: vi.fn() },
}));
vi.mock('../services/adminService', () => ({ adminPing: vi.fn() }));

const member = { id: 1, fullName: 'Jane Doe', email: 'jane@example.com', roles: ['ROLE_GRC_ANALYST'] };

function renderAt(path) {
  authService.refresh.mockRejectedValue({ status: 401 });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('validates fields client-side and does not call the API', async () => {
    renderAt('/login');
    await userEvent.click(await screen.findByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('rejects malformed emails before submitting', async () => {
    renderAt('/login');
    await userEvent.type(await screen.findByLabelText('Email Address'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Password'), 'whatever1');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('submits credentials (with rememberMe), shows loading, prevents double submit and lands on profile', async () => {
    let resolve;
    authService.login.mockReturnValue(new Promise((r) => (resolve = r)));
    authService.getMe.mockResolvedValue(member);
    renderAt('/login');

    await userEvent.type(await screen.findByLabelText('Email Address'), '  jane@example.com ');
    await userEvent.type(screen.getByLabelText('Password'), 'Str0ng-Passphrase');
    await userEvent.click(screen.getByLabelText('Remember me'));
    const button = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(button);

    expect(await screen.findByRole('button', { name: /signing in/i })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /signing in/i }));
    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(authService.login).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'Str0ng-Passphrase',
      rememberMe: true,
    });

    resolve({ accessToken: 't', user: member });
    expect(await screen.findByRole('heading', { name: /your profile/i })).toBeInTheDocument();
  });

  it('shows a generic invalid-credentials message and re-enables the form', async () => {
    authService.login.mockRejectedValue({ status: 401, message: 'Invalid email or password' });
    renderAt('/login');
    await userEvent.type(await screen.findByLabelText('Email Address'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password1');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });

  it('shows a network error message when the server is unreachable', async () => {
    authService.login.mockRejectedValue({
      status: 0,
      isNetwork: true,
      message: 'Unable to reach the server. Check your connection and try again.',
    });
    renderAt('/login');
    await userEvent.type(await screen.findByLabelText('Email Address'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Str0ng-Passphrase');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to reach the server/i);
  });

  it('toggles password visibility', async () => {
    renderAt('/login');
    const input = await screen.findByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('does not pretend password reset exists', async () => {
    renderAt('/login');
    await userEvent.click(await screen.findByRole('button', { name: /forgot password/i }));
    expect(screen.getByText(/not available yet/i)).toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  async function fill({ name = 'Jane Doe', email = 'jane@example.com', pw = 'Str0ng-Passphrase', confirm = pw } = {}) {
    await userEvent.type(await screen.findByLabelText('Full Name'), name);
    await userEvent.type(screen.getByLabelText('Email Address'), email);
    await userEvent.type(screen.getByLabelText('Password'), pw);
    await userEvent.type(screen.getByLabelText('Confirm Password'), confirm);
  }

  it('has no role selector', async () => {
    renderAt('/register');
    await screen.findByLabelText('Full Name');
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('validates the form, including the password policy and confirmation', async () => {
    renderAt('/register');
    await fill({ name: 'J', email: 'bad', pw: 'short', confirm: 'different' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('registers (without sending confirm/roles) and sends the user to login with a success notice', async () => {
    authService.register.mockResolvedValue({ id: 1 });
    renderAt('/register');
    await fill();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Str0ng-Passphrase',
    });
    expect(await screen.findByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByText(/account created/i)).toBeInTheDocument();
  });

  it('shows a clear duplicate-email error on the email field', async () => {
    authService.register.mockRejectedValue({ status: 409, message: 'An account with this email already exists', fieldErrors: {} });
    renderAt('/register');
    await fill();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: /create account/i })).toBeEnabled();
  });

  it('renders server-side field validation errors', async () => {
    authService.register.mockRejectedValue({
      status: 400,
      message: 'Validation failed',
      fieldErrors: { password: 'Password must contain at least one letter and one digit' },
    });
    renderAt('/register');
    await fill();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByText('Password must contain at least one letter and one digit')).toBeInTheDocument(),
    );
  });
});
