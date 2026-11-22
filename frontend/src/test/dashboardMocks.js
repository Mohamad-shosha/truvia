import { vi } from 'vitest';

/** Builds a /api/dashboard/me payload for the given user. */
export function myDashboard(user, overrides = {}) {
  return {
    user,
    memberSince: '2026-10-01T09:00:00Z',
    lastLoginAt: '2026-11-22T08:00:00Z',
    previousLoginAt: '2026-11-21T08:00:00Z',
    passwordChangedAt: '2026-11-01T10:00:00Z',
    mustChangePassword: false,
    activeSessions: 1,
    modules: [
      {
        key: 'risks',
        title: 'Risk Register & Live Scoring',
        description: 'Central risk register.',
        status: 'PLANNED',
        path: null,
        plannedFor: 'Phase 4',
      },
    ],
    ...overrides,
  };
}

const days = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-11-${String(9 + i).padStart(2, '0')}`,
  count: i === 13 ? 5 : i % 3,
}));

export const adminDashboard = {
  totalUsers: 6,
  activeUsers: 5,
  disabledUsers: 1,
  usersByRole: [
    { role: 'ROLE_ADMIN', count: 1 },
    { role: 'ROLE_CISO', count: 1 },
    { role: 'ROLE_GRC_ANALYST', count: 2 },
    { role: 'ROLE_SOC_ANALYST', count: 2 },
    { role: 'ROLE_PENTESTER', count: 0 },
  ],
  activeSessions: 4,
  usersWithActiveSession: 3,
  activityDays: 14,
  loginsInPeriod: days.reduce((a, d) => a + d.count, 0),
  dailyLogins: days,
  recentUsers: [
    { id: 7, fullName: 'Sam Soc', email: 'sam@example.com', roles: ['ROLE_SOC_ANALYST'], createdAt: '2026-11-20T10:00:00Z', lastLoginAt: null },
  ],
  neverSignedInCount: 1,
  neverSignedIn: [
    { id: 7, fullName: 'Sam Soc', email: 'sam@example.com', roles: ['ROLE_SOC_ANALYST'], createdAt: '2026-11-20T10:00:00Z', lastLoginAt: null },
  ],
  initialPasswordCount: 2,
  initialPassword: [
    { id: 8, fullName: 'Gina Grc', email: 'gina@example.com', roles: ['ROLE_GRC_ANALYST'], createdAt: '2026-11-02T10:00:00Z', lastLoginAt: '2026-11-03T10:00:00Z' },
  ],
};

export const team = {
  activeMembers: 5,
  byRole: [
    { role: 'ROLE_ADMIN', count: 1 },
    { role: 'ROLE_CISO', count: 1 },
    { role: 'ROLE_GRC_ANALYST', count: 2 },
    { role: 'ROLE_SOC_ANALYST', count: 1 },
    { role: 'ROLE_PENTESTER', count: 0 },
  ],
};

export const currentSession = {
  id: 'fam-current',
  startedAt: '2026-11-22T08:00:00Z',
  lastActiveAt: '2026-11-22T08:30:00Z',
  expiresAt: '2026-11-22T20:00:00Z',
  rememberMe: false,
  current: true,
};

/** Module factory for vi.mock('../services/dashboardService'): safe defaults every test can override. */
export function dashboardServiceMock() {
  return {
    getMyDashboard: vi.fn(() => Promise.resolve(myDashboard({ id: 1, fullName: 'Jane Doe', email: 'jane@example.com', roles: ['ROLE_GRC_ANALYST'] }))),
    getAdminDashboard: vi.fn(() => Promise.resolve(adminDashboard)),
    getTeam: vi.fn(() => Promise.resolve(team)),
    listSessions: vi.fn(() => Promise.resolve([currentSession])),
    revokeSession: vi.fn(() => Promise.resolve()),
    revokeOtherSessions: vi.fn(() => Promise.resolve(0)),
  };
}
