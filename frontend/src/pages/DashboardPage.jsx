import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard, getMyDashboard, getTeam } from '../services/dashboardService';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import TrendChart from '../components/dashboard/TrendChart';
import SessionsPanel from '../components/dashboard/SessionsPanel';
import {
  ModuleGrid,
  Panel,
  PeopleList,
  PlannedKpi,
  RoleBars,
  StatCard,
  lastSeen,
} from '../components/dashboard/Widgets';
import { firstName, formatDate, formatDateTime, formatRelative, roleLabel } from '../utils/format';

/** Loads one dashboard resource with loading / error / retry state. */
function useResource(loader, enabled = true) {
  const [state, setState] = useState({ status: enabled ? 'loading' : 'idle', data: null, error: '' });
  const load = useCallback(async () => {
    if (!enabled) return;
    setState((s) => ({ ...s, status: s.data ? 'ready' : 'loading', error: '' }));
    try {
      setState({ status: 'ready', data: await loader(), error: '' });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Something went wrong.' });
    }
  }, [loader, enabled]);
  useEffect(() => {
    load();
  }, [load]);
  return [state, load];
}

function Loading({ label }) {
  return (
    <div className="card card--center">
      <Spinner size={26} label={label} />
    </div>
  );
}

function LoadError({ message, onRetry }) {
  return (
    <div className="card stack">
      <Alert>{message}</Alert>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/* ---------------- Shared: my workspace ---------------- */

function MySecurity({ me }) {
  return (
    <div className="stats">
      <StatCard
        id="stat-previous-login"
        label="Previous sign-in"
        value={me.previousLoginAt ? formatRelative(me.previousLoginAt) : 'First sign-in'}
        hint={me.previousLoginAt ? formatDateTime(me.previousLoginAt) : 'Welcome aboard'}
      />
      <StatCard
        id="stat-sessions"
        label="Active sessions"
        value={me.activeSessions}
        hint={me.activeSessions === 1 ? 'Only this browser' : 'Across your devices'}
      />
      <StatCard
        id="stat-password"
        label="Password"
        tone={me.mustChangePassword ? 'warning' : 'good'}
        value={me.mustChangePassword ? 'Set by admin' : 'Your own'}
        hint={me.passwordChangedAt ? `Changed ${formatRelative(me.passwordChangedAt)}` : 'Not changed yet'}
      />
      <StatCard id="stat-member" label="Member since" value={formatDate(me.memberSince)} />
    </div>
  );
}

/* ---------------- Admin: platform overview ---------------- */

function AdminOverview() {
  const [state, reload] = useResource(getAdminDashboard);
  if (state.status === 'loading') return <Loading label="Loading platform overview" />;
  if (state.status === 'error') return <LoadError message={state.error} onRetry={reload} />;
  const d = state.data;

  return (
    <>
      <div className="section-head">
        <h2 className="section-title">Platform overview</h2>
        <Button variant="ghost" className="btn btn--ghost btn--sm" onClick={reload}>
          Refresh
        </Button>
      </div>

      <div className="stats">
        <StatCard id="stat-total-users" label="Accounts" value={d.totalUsers} hint={`${d.activeUsers} active`} />
        <StatCard
          id="stat-disabled-users"
          label="Disabled"
          value={d.disabledUsers}
          hint={d.disabledUsers ? 'Cannot sign in' : 'None'}
        />
        <StatCard
          id="stat-live-sessions"
          label="Signed in now"
          value={d.usersWithActiveSession}
          hint={`${d.activeSessions} live session${d.activeSessions === 1 ? '' : 's'}`}
        />
        <StatCard
          id="stat-logins-period"
          label={`Sign-ins, last ${d.activityDays} days`}
          value={d.loginsInPeriod}
        />
      </div>

      <div className="grid-2">
        <Panel id="activity" title="Sign-in activity" subtitle={`Successful sign-ins per day (UTC), last ${d.activityDays} days`}>
          <TrendChart data={d.dailyLogins} label={`Successful sign-ins per day, last ${d.activityDays} days`} />
        </Panel>
        <Panel id="roles" title="Accounts by role" subtitle="All accounts, including disabled">
          <RoleBars items={d.usersByRole} />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel
          id="attention-password"
          title="Still on an admin-set password"
          subtitle={`${d.initialPasswordCount} active account${d.initialPasswordCount === 1 ? '' : 's'} should choose their own password`}
          action={<Link to="/admin">Manage</Link>}
        >
          <PeopleList
            people={d.initialPassword}
            empty="Everyone has chosen their own password."
            secondary={(p) => `Account created ${formatRelative(p.createdAt)}`}
          />
        </Panel>
        <Panel
          id="attention-never"
          title="Never signed in"
          subtitle={`${d.neverSignedInCount} active account${d.neverSignedInCount === 1 ? '' : 's'} not used yet`}
          action={<Link to="/admin">Manage</Link>}
        >
          <PeopleList
            people={d.neverSignedIn}
            empty="Every active account has signed in at least once."
            secondary={(p) => `Created ${formatRelative(p.createdAt)}`}
          />
        </Panel>
      </div>

      <Panel id="recent-users" title="Newest accounts" action={<Link to="/admin">Open directory</Link>}>
        <PeopleList people={d.recentUsers} empty="No accounts yet." secondary={lastSeen} />
      </Panel>
    </>
  );
}

/* ---------------- CISO: executive view ---------------- */

const EXECUTIVE_KPIS = [
  { title: 'Organisational risk score', phase: 'Phase 4' },
  { title: 'Financial exposure', phase: 'Phase 4' },
  { title: 'Compliance posture', phase: 'Phase 5' },
  { title: 'Mean time to remediate', phase: 'Phase 6' },
];

function ExecutiveView({ showTeam }) {
  const [team, reload] = useResource(getTeam, showTeam);
  return (
    <>
      <div className="section-head">
        <h2 className="section-title">Executive view</h2>
      </div>
      <div className="stats">
        {EXECUTIVE_KPIS.map((k) => (
          <PlannedKpi key={k.title} {...k} />
        ))}
      </div>
      {showTeam && (
        <Panel
          id="team"
          title="Security team"
          subtitle={team.data ? `${team.data.activeMembers} active members by role` : 'Active members by role'}
        >
          {team.status === 'loading' && <Spinner size={22} label="Loading team" />}
          {team.status === 'error' && <LoadError message={team.error} onRetry={reload} />}
          {team.status === 'ready' && <RoleBars items={team.data.byRole.filter((r) => r.role !== 'ROLE_ADMIN')} unit="members" />}
        </Panel>
      )}
    </>
  );
}

/* ---------------- Page ---------------- */

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [me, reloadMe] = useResource(getMyDashboard);
  const isAdmin = hasRole('ROLE_ADMIN');
  const isCiso = hasRole('ROLE_CISO');

  return (
    <section className="page page--wide" aria-labelledby="dashboard-title">
      <header className="dash-head">
        <div>
          <p className="dash-head__eyebrow muted">{formatDate(new Date().toISOString())}</p>
          <h1 id="dashboard-title" className="page__title">
            Welcome back, {firstName(user.fullName)}
          </h1>
        </div>
        <div className="badges">
          {user.roles.map((r) => (
            <span key={r} className="badge">
              {roleLabel(r)}
            </span>
          ))}
        </div>
      </header>

      {me.status === 'loading' && <Loading label="Loading your workspace" />}
      {me.status === 'error' && <LoadError message={me.error} onRetry={reloadMe} />}
      {me.status === 'ready' && (
        <>
          {me.data.mustChangePassword && (
            <Alert variant="warning" id="change-password-reminder">
              You are still using the password your administrator set.{' '}
              <Link to="/profile">Choose your own password</Link> to keep your account secure.
            </Alert>
          )}
          <MySecurity me={me.data} />
        </>
      )}

      {isAdmin && <AdminOverview />}
      {isCiso && <ExecutiveView showTeam />}

      <SessionsPanel onChange={reloadMe} />

      {me.status === 'ready' && me.data.modules.length > 0 && (
        <Panel id="modules" title="Your modules" subtitle="What your role works with. Planned modules show their roadmap phase.">
          <ModuleGrid modules={me.data.modules} />
        </Panel>
      )}
    </section>
  );
}
