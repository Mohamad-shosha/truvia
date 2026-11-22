import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  getAdminDashboard,
  getMyDashboard,
  getTeam,
  listSessions,
  revokeOtherSessions,
  revokeSession,
} from '../services/dashboardService';
import { adminListUsers, adminSetUserStatus } from '../services/adminService';
import { currentSession, myDashboard } from './dashboardMocks';
import { niceMax } from '../components/dashboard/TrendChart';

vi.mock('../services/authService', () => ({
  authService: { login: vi.fn(), getMe: vi.fn(), refresh: vi.fn(), logout: vi.fn(), changePassword: vi.fn() },
}));
vi.mock('../services/riskService', async () => (await import('./dashboardMocks')).riskServiceMock());
vi.mock('../services/dashboardService', async () => (await import('./dashboardMocks')).dashboardServiceMock());
vi.mock('../services/adminService', () => ({
  adminPing: vi.fn(),
  adminListUsers: vi.fn(),
  adminCreateUser: vi.fn(),
  adminResetPassword: vi.fn(),
  adminSetUserStatus: vi.fn(),
}));

const member = { id: 1, fullName: 'Jane Doe', email: 'jane@example.com', roles: ['ROLE_GRC_ANALYST'] };
const admin = { id: 2, fullName: 'Ada Admin', email: 'ada@example.com', roles: ['ROLE_ADMIN'] };
const ciso = { id: 3, fullName: 'Cleo Ciso', email: 'cleo@example.com', roles: ['ROLE_CISO'] };

function renderAs(user, path = '/dashboard', dashboard = myDashboard(user)) {
  authService.refresh.mockResolvedValue({ accessToken: 't', user });
  authService.getMe.mockResolvedValue(user);
  getMyDashboard.mockResolvedValue(dashboard);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('dashboard: shared workspace', () => {
  it('greets the analyst and shows their security summary and planned modules only', async () => {
    renderAs(member);

    expect(await screen.findByText(/welcome back, jane/i)).toBeInTheDocument();
    expect(await screen.findByText('Previous sign-in')).toBeInTheDocument();
    expect(within(document.getElementById('stat-sessions')).getByText('1')).toBeInTheDocument();
    expect(within(document.getElementById('stat-password')).getByText('Your own')).toBeInTheDocument();

    const modules = await screen.findByRole('region', { name: /your modules/i });
    expect(within(modules).getByText('Risk Register & Live Scoring')).toBeInTheDocument();
    expect(within(modules).getByText('Phase 4')).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: /platform overview/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /executive view/i })).not.toBeInTheDocument();
    expect(getAdminDashboard).not.toHaveBeenCalled();
    expect(getTeam).not.toHaveBeenCalled();
  });

  it('reminds users on an admin-set password to choose their own', async () => {
    renderAs(member, '/dashboard', myDashboard(member, { mustChangePassword: true, passwordChangedAt: null }));

    const reminder = await screen.findByText(/still using the password your administrator set/i);
    expect(within(reminder).getByRole('link', { name: /choose your own password/i })).toHaveAttribute('href', '/profile');
    expect(within(document.getElementById('stat-password')).getByText('Set by admin')).toBeInTheDocument();
  });

  it('shows a retryable error when the workspace fails to load', async () => {
    getMyDashboard.mockRejectedValueOnce({ status: 500, message: 'Workspace unavailable' });
    renderAs(member);

    expect(await screen.findByText('Workspace unavailable')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Previous sign-in')).toBeInTheDocument();
  });
});

describe('dashboard: sessions', () => {
  const other = { ...currentSession, id: 'fam-other', current: false, rememberMe: true };

  it('lists sessions, flags this browser and signs out another session', async () => {
    listSessions.mockResolvedValue([currentSession, other]);
    renderAs(member);

    const panel = await screen.findByRole('region', { name: /active sessions/i });
    expect(await within(panel).findByText('This browser')).toBeInTheDocument();
    expect(within(panel).getByText('Another sign-in')).toBeInTheDocument();
    expect(within(panel).getAllByRole('button', { name: /^sign out session/i })).toHaveLength(1);

    listSessions.mockResolvedValue([currentSession]);
    await userEvent.click(within(panel).getByRole('button', { name: /^sign out session/i }));

    expect(revokeSession).toHaveBeenCalledWith('fam-other');
    expect(await within(panel).findByText('Session signed out.')).toBeInTheDocument();
    expect(within(panel).queryByText('Another sign-in')).not.toBeInTheDocument();
  });

  it('signs out all other sessions at once', async () => {
    listSessions.mockResolvedValue([currentSession, other, { ...other, id: 'fam-3' }]);
    revokeOtherSessions.mockResolvedValue(2);
    renderAs(member);

    const button = await screen.findByRole('button', { name: /sign out all others/i });
    listSessions.mockResolvedValue([currentSession]);
    await userEvent.click(button);

    expect(revokeOtherSessions).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Signed out of 2 other sessions.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign out all others/i })).not.toBeInTheDocument();
  });
});

describe('dashboard: role-specific sections', () => {
  it('shows administrators the platform overview with activity, roles and accounts needing attention', async () => {
    renderAs(admin);

    expect(await screen.findByRole('heading', { name: /platform overview/i })).toBeInTheDocument();
    expect(within(document.getElementById('stat-total-users')).getByText('6')).toBeInTheDocument();
    expect(within(document.getElementById('stat-live-sessions')).getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /successful sign-ins per day/i })).toBeInTheDocument();

    const roles = screen.getByRole('region', { name: /accounts by role/i });
    expect(within(roles).getByText('GRC Analyst')).toBeInTheDocument();

    const never = screen.getByRole('region', { name: /never signed in/i });
    expect(within(never).getByText('Sam Soc')).toBeInTheDocument();
    const initial = screen.getByRole('region', { name: /admin-set password/i });
    expect(within(initial).getByText('Gina Grc')).toBeInTheDocument();
    expect(getTeam).not.toHaveBeenCalled();
  });

  it('shows the CISO the risk overview, planned compliance KPIs and the security team', async () => {
    renderAs(ciso);

    expect(await screen.findByText('Compliance score')).toBeInTheDocument();
    expect(screen.getAllByText(/arrives with phase/i).length).toBeGreaterThan(0);

    const teamPanel = screen.getByRole('region', { name: /security team/i });
    expect(await within(teamPanel).findByText('SOC Analyst')).toBeInTheDocument();
    expect(within(teamPanel).queryByText('Administrator')).not.toBeInTheDocument();
    expect(getAdminDashboard).not.toHaveBeenCalled();
  });

  it('hides the administration link from non-admins and shows it to admins', async () => {
    renderAs(member);
    await screen.findByText(/welcome back/i);
    expect(screen.queryByRole('link', { name: /users & access/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('aria-current', 'page');
  });
});

describe('admin directory: account status', () => {
  it('disables another account after confirmation and never offers to disable yourself', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const employee = {
      id: 9, fullName: 'Eve Emp', email: 'eve@example.com', roles: ['ROLE_SOC_ANALYST'], enabled: true,
      lastLoginAt: null, usingInitialPassword: true,
    };
    adminListUsers.mockResolvedValue([{ ...admin, enabled: true, lastLoginAt: '2026-11-22T08:00:00Z', usingInitialPassword: false }, employee]);
    adminSetUserStatus.mockResolvedValue({ ...employee, enabled: false });
    renderAs(admin, '/admin');

    expect(await screen.findByText('Eve Emp')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /disable ada admin/i })).not.toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /disable eve emp/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(adminSetUserStatus).toHaveBeenCalledWith(9, false);
    expect(await screen.findByText('Eve Emp was disabled.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable eve emp/i })).toBeInTheDocument();
  });
});

describe('TrendChart axis', () => {
  it('rounds the axis maximum up to a readable value', () => {
    expect(niceMax(0)).toBe(4);
    expect(niceMax(3)).toBe(4);
    expect(niceMax(7)).toBe(10);
    expect(niceMax(13)).toBe(20);
    expect(niceMax(41)).toBe(50);
    expect(niceMax(120)).toBe(200);
  });
});
