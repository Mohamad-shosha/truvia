import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import { adminCreateUser, adminListUsers, adminResetPassword } from '../services/adminService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    getMe: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock('../services/adminService', () => ({
  adminPing: vi.fn(),
  adminListUsers: vi.fn(),
  adminCreateUser: vi.fn(),
  adminResetPassword: vi.fn(),
}));

const member = { id: 1, fullName: 'Jane Doe', email: 'jane@example.com', roles: ['ROLE_GRC_ANALYST'] };
const admin = { id: 2, fullName: 'Ada Admin', email: 'ada@example.com', roles: ['ROLE_ADMIN'] };

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

function renderAuthenticated(path, user = member) {
  authService.refresh.mockResolvedValue({ accessToken: 'valid-token', user });
  authService.getMe.mockResolvedValue(user);
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

  it('has no Sign Up link or Forgot Password button', async () => {
    renderAt('/login');
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /forgot password/i })).not.toBeInTheDocument();
  });
});

describe('ProfilePage Password Change', () => {
  it('allows users to change their own password with validation', async () => {
    authService.changePassword.mockResolvedValue({ message: 'Password changed successfully' });
    renderAuthenticated('/profile', member);

    expect(await screen.findByRole('heading', { name: /your profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /security & password/i })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Current Password'), 'Old-Password-1');
    await userEvent.type(screen.getByLabelText('New Password'), 'New-Secret-Pass-2');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'New-Secret-Pass-2');

    await userEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(authService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Old-Password-1',
      newPassword: 'New-Secret-Pass-2',
    });
    expect(await screen.findByText(/your password has been changed successfully/i)).toBeInTheDocument();
  });
});

describe('Admin User Provisioning', () => {
  it('allows admin to create user and view company directory', async () => {
    adminListUsers.mockResolvedValue([
      { id: 1, fullName: 'Jane Doe', email: 'jane@example.com', roles: ['ROLE_GRC_ANALYST'], enabled: true },
    ]);
    adminCreateUser.mockResolvedValue({
      id: 2,
      fullName: 'Bob Smith',
      email: 'bob@example.com',
      roles: ['ROLE_SOC_ANALYST'],
      enabled: true,
    });

    renderAuthenticated('/admin', admin);

    expect(await screen.findByRole('heading', { name: /administration & user provisioning/i })).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Full Name'), 'Bob Smith');
    await userEvent.type(screen.getByLabelText('Email Address'), 'bob@example.com');
    await userEvent.type(screen.getByLabelText('Initial Password'), 'Initial-Pass-123');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(adminCreateUser).toHaveBeenCalledWith({
      fullName: 'Bob Smith',
      email: 'bob@example.com',
      password: 'Initial-Pass-123',
      role: 'ROLE_GRC_ANALYST',
    });
  });
});
