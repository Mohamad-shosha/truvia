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

const heat = Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]);
heat[3][3] = 2;
heat[2][3] = 1;

export const sampleRisk = {
  id: 1,
  code: 'RSK-001',
  title: 'AI-Driven Attacks & Deepfake Fraud',
  description: 'Sample',
  category: 'Threat & AI Security',
  businessService: 'Executive Communications & Finance',
  owner: 'CISO / SecOps',
  likelihood: 5,
  impact: 5,
  inherentScore: 25,
  inherentLevel: 'CRITICAL',
  residualLikelihood: 4,
  residualImpact: 4,
  residualScore: 16,
  residualLevel: 'CRITICAL',
  treatment: 'MITIGATE',
  status: 'IN_PROGRESS',
  sample: true,
  createdBy: null,
  createdAt: '2026-10-01T09:00:00Z',
  updatedAt: '2026-11-20T09:00:00Z',
  closedAt: null,
};

export const riskOverview = {
  days: 30,
  sampleData: true,
  activeRisks: 18,
  activeRisksPrevious: 16,
  highRisks: 9,
  highRisksPrevious: 10,
  criticalRisks: 2,
  riskScore: 34.2,
  riskScorePrevious: 31.0,
  trend: [
    { date: '2026-11-20', riskScore: 31.0, activeRisks: 16 },
    { date: '2026-11-21', riskScore: 33.5, activeRisks: 17 },
    { date: '2026-11-22', riskScore: 34.2, activeRisks: 18 },
  ],
  heatmap: heat,
  byStatus: { OPEN: 10, IN_PROGRESS: 8, CLOSED: 6 },
  byInherentLevel: { CRITICAL: 6, HIGH: 7, MEDIUM: 4, LOW: 1 },
  topRisks: [sampleRisk],
};

export const activityItems = [
  { id: 1, type: 'RISK_UPDATED', title: 'RSK-006 updated', detail: 'VPN gateway', actorName: 'Omar H.', sample: true, createdAt: '2026-11-22T08:00:00Z' },
];

/** Module factory for vi.mock('../services/riskService'): real role constants, mocked calls. */
export async function riskServiceMock() {
  const actual = await vi.importActual('../services/riskService');
  return {
    ...actual,
    listRisks: vi.fn(() => Promise.resolve([sampleRisk])),
    createRisk: vi.fn(),
    updateRisk: vi.fn(),
    deleteRisk: vi.fn(() => Promise.resolve()),
    getRiskOverview: vi.fn(() => Promise.resolve(riskOverview)),
    getRecentActivity: vi.fn(() => Promise.resolve(activityItems)),
    downloadRiskCsv: vi.fn(() => Promise.resolve()),
  };
}
