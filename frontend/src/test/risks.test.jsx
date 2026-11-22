import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getMyDashboard } from '../services/dashboardService';
import { createRisk, downloadRiskCsv, getRiskOverview, listRisks } from '../services/riskService';
import { myDashboard, sampleRisk } from './dashboardMocks';
import { scoreDomain } from '../components/charts/LineChart';
import { levelOf, percentChange } from '../utils/risk';

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

const grc = { id: 1, fullName: 'Gina Grc', email: 'gina@example.com', roles: ['ROLE_GRC_ANALYST'] };
const soc = { id: 4, fullName: 'Sam Soc', email: 'sam@example.com', roles: ['ROLE_SOC_ANALYST'] };
const pentester = { id: 5, fullName: 'Pia Pentest', email: 'pia@example.com', roles: ['ROLE_PENTESTER'] };

function renderAs(user, path = '/dashboard') {
  authService.refresh.mockResolvedValue({ accessToken: 't', user });
  authService.getMe.mockResolvedValue(user);
  getMyDashboard.mockResolvedValue(myDashboard(user));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('risk dashboard', () => {
  it('shows KPIs with deltas, trend, heat map, rings, top risks and activity, labelled as sample data', async () => {
    renderAs(grc);

    expect(await screen.findByText(/come from/i)).toHaveTextContent(/sample data/i);
    const total = document.getElementById('kpi-total');
    expect(within(total).getByText('18')).toBeInTheDocument();
    expect(within(total).getByText(/up 13% vs 30 days ago/i)).toBeInTheDocument();
    expect(within(document.getElementById('kpi-high')).getByText(/down 10% vs 30 days ago/i)).toBeInTheDocument();
    expect(within(document.getElementById('kpi-high')).getByText('2 critical need immediate action')).toBeInTheDocument();
    expect(screen.getByText('Compliance score')).toBeInTheDocument();
    expect(screen.getByText('Open incidents')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: /organisational risk score per day/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /residual likelihood and impact/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /risks by status: in progress 8, open 10, closed 6/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /inherent level: critical 6, high 7/i })).toBeInTheDocument();

    const top = screen.getByRole('region', { name: /top risks/i });
    expect(within(top).getByText('RSK-001')).toBeInTheDocument();
    expect(within(top).getByText('AI-Driven Attacks & Deepfake Fraud')).toBeInTheDocument();

    const activity = screen.getByRole('region', { name: /recent activity/i });
    expect(await within(activity).findByText('RSK-006 updated')).toBeInTheDocument();
  });

  it('reloads for a different period and exports the register', async () => {
    renderAs(grc);
    await screen.findByText(/come from/i);
    expect(getRiskOverview).toHaveBeenLastCalledWith(30);

    await userEvent.selectOptions(screen.getByLabelText('Period'), '90');
    expect(getRiskOverview).toHaveBeenLastCalledWith(90);

    await userEvent.click(screen.getByRole('button', { name: /^export$/i }));
    expect(downloadRiskCsv).toHaveBeenCalledTimes(1);
  });

  it('does not show risk data or the Risks link to roles without access', async () => {
    renderAs(pentester);
    expect(await screen.findByText(/welcome back, pia/i)).toBeInTheDocument();
    expect(screen.queryByText('Total risks')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^risks$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    expect(getRiskOverview).not.toHaveBeenCalled();
  });

  it('blocks the risk register route for roles without access', async () => {
    renderAs(pentester, '/risks');
    expect(await screen.findByRole('heading', { name: /access denied/i })).toBeInTheDocument();
    expect(listRisks).not.toHaveBeenCalled();
  });
});

describe('risk register page', () => {
  it('lists risks and filters them by search', async () => {
    createRisk.mockResolvedValue({ ...sampleRisk, id: 2, code: 'RSK-002', sample: false });
    renderAs(grc, '/risks');

    expect(await screen.findByRole('heading', { name: /risk register/i })).toBeInTheDocument();
    expect(await screen.findByText('AI-Driven Attacks & Deepfake Fraud')).toBeInTheDocument();
    expect(screen.getByText('1 of 1 risks')).toBeInTheDocument();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Filter risks' }), 'nothing-matches');
    expect(screen.getAllByText(/no risks match/i).length).toBeGreaterThan(0);
  });

  it('creates a risk and rejects residual above inherent client-side', async () => {
    createRisk.mockResolvedValue({ ...sampleRisk, id: 2, code: 'RSK-002', sample: false });
    renderAs(grc, '/risks');
    await userEvent.click(await screen.findByRole('button', { name: /new risk/i }));

    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Title'), 'Exposed admin panel');
    await userEvent.type(within(dialog).getByLabelText('Business service'), 'Customer Portal');
    await userEvent.type(within(dialog).getByLabelText('Risk owner'), 'SRE Manager');

    await userEvent.selectOptions(within(dialog).getAllByLabelText('Likelihood')[1], '5');
    await userEvent.selectOptions(within(dialog).getAllByLabelText('Impact')[1], '5');
    await userEvent.click(within(dialog).getByRole('button', { name: /create risk/i }));
    expect(within(dialog).getByText(/residual risk cannot be higher/i)).toBeInTheDocument();
    expect(createRisk).not.toHaveBeenCalled();

    await userEvent.selectOptions(within(dialog).getAllByLabelText('Likelihood')[0], '5');
    await userEvent.selectOptions(within(dialog).getAllByLabelText('Impact')[0], '5');
    expect(within(dialog).getAllByText('Critical').length).toBeGreaterThan(0);
    await userEvent.click(within(dialog).getByRole('button', { name: /create risk/i }));

    expect(createRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Exposed admin panel',
        businessService: 'Customer Portal',
        owner: 'SRE Manager',
        likelihood: 5,
        impact: 5,
        residualLikelihood: 5,
        residualImpact: 5,
        status: 'OPEN',
      }),
    );
    expect(await screen.findByText('RSK-002 created.')).toBeInTheDocument();
  });

  it('gives SOC analysts a read-only view', async () => {
    renderAs(soc, '/risks');
    await screen.findByText('AI-Driven Attacks & Deepfake Fraud');
    expect(screen.queryByRole('button', { name: /new risk/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /view rsk-001/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Title')).toBeDisabled();
    expect(within(dialog).queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('top-bar search opens the register filtered by the query', async () => {
    renderAs(grc);
    await screen.findByText(/welcome back, gina/i);
    const search = within(document.querySelector('.topsearch')).getByRole('searchbox');
    await userEvent.type(search, 'ransomware{Enter}');
    expect(await screen.findByRole('heading', { name: /risk register/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Filter risks' })).toHaveValue('ransomware');
  });
});

describe('risk helpers', () => {
  it('bands scores like the backend and computes percentage change', () => {
    expect([1, 4, 5, 9, 10, 15, 16, 25].map(levelOf)).toEqual([
      'LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'HIGH', 'HIGH', 'CRITICAL', 'CRITICAL',
    ]);
    expect(percentChange(18, 16)).toBe(13);
    expect(percentChange(9, 10)).toBe(-10);
    expect(percentChange(5, null)).toBeNull();
    expect(percentChange(5, 0)).toBeNull();
  });

  it('pads the trend axis to readable bounds', () => {
    expect(scoreDomain([61, 68])).toEqual([50, 80]);
    expect(scoreDomain([])).toEqual([0, 100]);
    expect(scoreDomain([2, 3])).toEqual([0, 20]);
  });
});
