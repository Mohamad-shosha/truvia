import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import { adminListUsers, adminPing } from '../services/adminService';
import { notifySessionExpired } from '../services/apiClient';

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

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

const signedOut = () => authService.refresh.mockRejectedValue({ status: 401, message: 'no session' });
const signedIn = (user) => {
  authService.refresh.mockResolvedValue({ accessToken: 't', user });
  authService.getMe.mockResolvedValue(user);
};

describe('auth initialization and protected routes', () => {
  it('does not flash protected content while restoring the session, then redirects to login', async () => {
    let reject;
    authService.refresh.mockReturnValue(new Promise((_, r) => (reject = r)));
    renderApp('/profile');

    expect(screen.getByRole('status', { name: /restoring your session/i })).toBeInTheDocument();
    expect(screen.queryByText(/your profile/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Log In' })).not.toBeInTheDocument();

    reject({ status: 401 });
    expect(await screen.findByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(authService.getMe).not.toHaveBeenCalled();
  });

  it('restores an existing session and shows the profile from /api/auth/me', async () => {
    signedIn(member);
    renderApp('/profile');
    expect(await screen.findByText('Jane Doe', { selector: '#profile-name' })).toBeInTheDocument();
    expect(screen.getByText('jane@example.com', { selector: '#profile-email' })).toBeInTheDocument();
    expect(screen.getByText('GRC Analyst')).toBeInTheDocument();
    expect(authService.getMe).toHaveBeenCalled();
  });

  it('redirects signed-in users away from login (no redirect loop)', async () => {
    signedIn(member);
    renderApp('/login');
    expect(await screen.findByRole('heading', { name: /your profile/i })).toBeInTheDocument();
  });

  it('unknown routes render 404', async () => {
    signedOut();
    renderApp('/nope');
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument();
  });

  it('shows a retryable error state when the profile cannot be loaded', async () => {
    authService.refresh.mockResolvedValue({ accessToken: 't', user: member });
    authService.getMe.mockRejectedValueOnce({ status: 500, message: 'boom' });
    authService.getMe.mockResolvedValueOnce(member);
    renderApp('/profile');
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Jane Doe', { selector: '#profile-name' })).toBeInTheDocument();
  });
});

describe('role-aware navigation', () => {
  it('hides the admin link and shows Access denied for non-admins', async () => {
    signedIn(member);
    renderApp('/admin');
    expect(await screen.findByRole('heading', { name: /access denied/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /administration/i })).not.toBeInTheDocument();
    expect(adminListUsers).not.toHaveBeenCalled();
  });

  it('shows the admin link and renders admin provisioning for admins', async () => {
    signedIn(admin);
    adminListUsers.mockResolvedValue([]);
    renderApp('/profile');
    await userEvent.click(await screen.findByRole('link', { name: /administration/i }));
    expect(await screen.findByRole('heading', { name: /administration & user provisioning/i })).toBeInTheDocument();
  });

  it('surfaces an error when admin user list fails to load', async () => {
    signedIn(admin);
    adminListUsers.mockRejectedValue({ status: 500, message: 'Server error loading users' });
    renderApp('/admin');
    expect(await screen.findByRole('alert')).toHaveTextContent(/server error loading users/i);
  });
});

describe('logout and session expiry', () => {
  it('logout clears the session and tells the user it was revoked on the server', async () => {
    signedIn(member);
    authService.logout.mockResolvedValue({ serverRevoked: true });
    renderApp('/profile');
    await userEvent.click(await screen.findByRole('button', { name: /sign out/i }));
    expect(await screen.findByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByText(/you have been signed out/i)).toBeInTheDocument();
  });

  it('logout is honest when the server could not be reached', async () => {
    signedIn(member);
    authService.logout.mockResolvedValue({ serverRevoked: false });
    renderApp('/profile');
    await userEvent.click(await screen.findByRole('button', { name: /sign out/i }));
    expect(await screen.findByText(/could not confirm the server session was revoked/i)).toBeInTheDocument();
  });

  it('redirects to login with an expiry notice when the API client reports session expiry', async () => {
    signedIn(member);
    renderApp('/profile');
    await screen.findByText('Jane Doe', { selector: '#profile-name' });

    // Exactly what the API client calls after a refresh is rejected while signed in.
    act(() => notifySessionExpired());

    expect(await screen.findByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByText(/your session has expired/i)).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe', { selector: '#profile-name' })).not.toBeInTheDocument();
  });
});
