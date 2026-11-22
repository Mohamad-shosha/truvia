import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecentActivity, getRiskOverview } from '../../services/riskService';
import Alert from '../Alert';
import Button from '../Button';
import Spinner from '../Spinner';
import LineChart from '../charts/LineChart';
import HeatMap from '../charts/HeatMap';
import RingChart from '../charts/RingChart';
import { LevelBadge, SampleTag, TreatmentTag } from '../risk/RiskBits';
import { Panel } from './Widgets';
import { ArrowIcon, ClockIcon } from '../icons';
import { formatRelative } from '../../utils/format';
import { LEVELS, LEVEL_LABELS, STATUS_LABELS, percentChange } from '../../utils/risk';

/** KPI tile. `downIsGood` decides whether a decrease is shown as an improvement (risks: yes). */
function Kpi({ id, label, value, now, previous, days, downIsGood = true, hint, suffix = '' }) {
  const pct = percentChange(now, previous);
  let delta = null;
  if (pct != null) {
    const improving = pct === 0 ? null : downIsGood ? pct < 0 : pct > 0;
    delta = (
      <span className={`kpi__delta${improving == null ? '' : improving ? ' is-good' : ' is-bad'}`}>
        <span aria-hidden="true">{pct > 0 ? '▲' : pct < 0 ? '▼' : '■'}</span> {pct > 0 ? 'Up' : pct < 0 ? 'Down' : 'No change'}{' '}
        {pct !== 0 && `${Math.abs(pct)}%`} vs {days} days ago
      </span>
    );
  }
  return (
    <div className="kpi" id={id}>
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">
        {value}
        {suffix}
      </span>
      {delta || <span className="kpi__delta">No history yet</span>}
      {hint && <span className="kpi__hint">{hint}</span>}
    </div>
  );
}

function PlannedKpi({ label, phase, note }) {
  return (
    <div className="kpi kpi--planned">
      <span className="kpi__label">{label}</span>
      <span className="kpi__value kpi__value--planned">—</span>
      <span className="kpi__delta">
        <ClockIcon width={13} height={13} /> Arrives with {phase}
      </span>
      <span className="kpi__hint">{note}</span>
    </div>
  );
}

function PlannedPanel({ title, subtitle, phase, children }) {
  return (
    <Panel title={title} subtitle={subtitle} action={<span className="pill"><ClockIcon width={13} height={13} /> {phase}</span>} className="panel--planned">
      <div className="planned-body">{children}</div>
    </Panel>
  );
}

function RecentActivity() {
  const [state, setState] = useState({ status: 'loading', items: [] });
  useEffect(() => {
    let alive = true;
    getRecentActivity(6)
      .then((items) => alive && setState({ status: 'ready', items }))
      .catch(() => alive && setState({ status: 'error', items: [] }));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <Panel id="recent-activity" title="Recent activity" subtitle="Who changed what across risks and accounts">
      {state.status === 'loading' && <Spinner size={20} label="Loading activity" />}
      {state.status === 'error' && <p className="muted empty-note">Activity could not be loaded.</p>}
      {state.status === 'ready' && state.items.length === 0 && <p className="muted empty-note">No activity yet.</p>}
      {state.status === 'ready' && state.items.length > 0 && (
        <ol className="activity">
          {state.items.map((a) => (
            <li key={a.id} className={`activity__item activity__item--${a.type.split('_')[0].toLowerCase()}`}>
              <div className="activity__top">
                <strong>{a.title}</strong>
                <span className="muted activity__time">{formatRelative(a.createdAt)}</span>
              </div>
              <span className="muted">
                {a.detail}
                {a.actorName ? ` · by ${a.actorName}` : ''}
                {a.sample ? ' · sample' : ''}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

/** Risk & compliance overview (the design's main dashboard) for roles that can read the register. */
export default function RiskOverview({ days, refreshKey }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: s.data ? 'ready' : 'loading' }));
    try {
      setState({ status: 'ready', data: await getRiskOverview(days), error: '' });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Could not load the risk overview.' });
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (state.status === 'loading') {
    return (
      <div className="card card--center">
        <Spinner size={26} label="Loading risk overview" />
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="card stack">
        <Alert>{state.error}</Alert>
        <Button variant="secondary" onClick={load}>
          Try again
        </Button>
      </div>
    );
  }

  const d = state.data;
  const trendFirst = d.trend.length ? Number(d.trend[0].riskScore) : null;
  const trendDelta = trendFirst == null ? null : Math.round((Number(d.riskScore) - trendFirst) * 10) / 10;

  return (
    <>
      {d.sampleData && (
        <Alert variant="info" id="sample-data-banner">
          The risk figures below come from <strong>sample data</strong> seeded for demonstration. They will switch to your real
          register as soon as it is loaded.
        </Alert>
      )}

      <div className="kpis">
        <Kpi id="kpi-total" label="Total risks" value={d.activeRisks} now={d.activeRisks} previous={d.activeRisksPrevious} days={d.days} hint="Open and in progress" />
        <Kpi
          id="kpi-high"
          label="High risks"
          value={d.highRisks}
          now={d.highRisks}
          previous={d.highRisksPrevious}
          days={d.days}
          hint={d.criticalRisks ? `${d.criticalRisks} critical need immediate action` : 'No critical residual risks'}
        />
        <PlannedKpi label="Compliance score" phase="Phase 5" note="ISO 27001 · NIST CSF · SOC 2 controls" />
        <PlannedKpi label="Open incidents" phase="Phase 6" note="Incident triage and SLA tracking" />
      </div>

      <div className="grid-main">
        <Panel
          id="risk-trend"
          title={`Risk score trend, last ${d.days} days`}
          subtitle={`Organisational risk score (0–100): average residual exposure of active risks. Now ${Number(d.riskScore).toFixed(1)}.`}
          action={
            trendDelta != null && (
              <span className={`pill${trendDelta > 0 ? ' pill--bad' : trendDelta < 0 ? ' pill--ok' : ''}`}>
                {trendDelta > 0 ? '+' : ''}
                {trendDelta} points
              </span>
            )
          }
        >
          <LineChart
            data={d.trend.map((p) => ({ date: p.date, value: p.riskScore }))}
            label={`Organisational risk score per day, last ${d.days} days`}
            unit="score"
            format={(v) => Number(v).toFixed(1)}
          />
        </Panel>
        <Panel id="heat-map" title="Risk heat map" subtitle="Active risks by residual likelihood × impact" action={<Link to="/risks">Open register</Link>}>
          <HeatMap cells={d.heatmap} />
        </Panel>
      </div>

      <div className="grid-3">
        <Panel id="risk-status" title="Risk status" subtitle="All risks in the register">
          <RingChart
            label="Risks by status"
            items={[
              { key: 'IN_PROGRESS', label: STATUS_LABELS.IN_PROGRESS, count: d.byStatus.IN_PROGRESS, tone: 'cat-1' },
              { key: 'OPEN', label: STATUS_LABELS.OPEN, count: d.byStatus.OPEN, tone: 'cat-2' },
              { key: 'CLOSED', label: STATUS_LABELS.CLOSED, count: d.byStatus.CLOSED, tone: 'cat-3' },
            ]}
          />
        </Panel>
        <Panel id="inherent-level" title="Inherent level" subtitle="Active risks before controls">
          <RingChart
            label="Active risks by inherent level"
            items={LEVELS.map((l) => ({ key: l, label: LEVEL_LABELS[l], count: d.byInherentLevel[l], tone: `lvl-${l.toLowerCase()}` }))}
          />
        </Panel>
        <PlannedPanel title="Control effectiveness" subtitle="Effective · partially effective · ineffective" phase="Phase 5">
          Control testing results appear here once compliance controls are tracked.
        </PlannedPanel>
      </div>

      <Panel
        id="top-risks"
        title="Top risks"
        subtitle="Highest residual exposure first"
        action={
          <Link to="/risks" className="inline-link">
            View all risks <ArrowIcon width={15} height={15} />
          </Link>
        }
      >
        {d.topRisks.length === 0 ? (
          <p className="muted empty-note">No active risks. Add one from the risk register.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table risk-table">
              <thead>
                <tr>
                  <th>Risk ID</th>
                  <th>Risk title</th>
                  <th>Category</th>
                  <th>Business service</th>
                  <th>Inherent</th>
                  <th>Residual</th>
                  <th>Treatment</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {d.topRisks.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/risks?q=${encodeURIComponent(r.code)}&status=ALL`} className="risk-code">
                        {r.code}
                      </Link>
                    </td>
                    <td className="risk-table__title">
                      <strong>{r.title}</strong>
                      {r.sample && <SampleTag />}
                    </td>
                    <td>
                      <span className="tag">{r.category}</span>
                    </td>
                    <td className="muted">{r.businessService}</td>
                    <td>
                      <LevelBadge level={r.inherentLevel} />
                    </td>
                    <td>
                      <LevelBadge level={r.residualLevel} />
                    </td>
                    <td>
                      <TreatmentTag treatment={r.treatment} />
                    </td>
                    <td className="muted">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid-2">
        <PlannedPanel title="AI recommendations" subtitle="Mitigations suggested from live threat feeds" phase="Phase 7">
          The AI remediation engine will propose prioritised actions for your top risks here, each with one-click apply.
        </PlannedPanel>
        <RecentActivity key={refreshKey} />
      </div>
    </>
  );
}
