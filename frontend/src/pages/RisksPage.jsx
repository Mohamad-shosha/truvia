import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RISK_WRITE_ROLES, createRisk, deleteRisk, downloadRiskCsv, listRisks, updateRisk } from '../services/riskService';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import RiskFormModal from '../components/risk/RiskFormModal';
import { LevelBadge, SampleTag, StatusText, TreatmentTag } from '../components/risk/RiskBits';
import { LEVELS, LEVEL_LABELS, STATUSES, STATUS_LABELS } from '../utils/risk';

const SORTS = {
  residual: (a, b) => b.residualScore - a.residualScore || b.inherentScore - a.inherentScore || a.id - b.id,
  inherent: (a, b) => b.inherentScore - a.inherentScore || a.id - b.id,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  code: (a, b) => a.id - b.id,
};

export default function RisksPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole(...RISK_WRITE_ROLES);
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ status: 'loading', risks: [], error: '' });
  const [editing, setEditing] = useState(null); // null | 'new' | risk
  const [notice, setNotice] = useState('');
  const [exporting, setExporting] = useState(false);

  const q = params.get('q') || '';
  const statusFilter = params.get('status') || 'ACTIVE';
  const levelFilter = params.get('level') || '';
  const sort = params.get('sort') || 'residual';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const load = useCallback(async () => {
    try {
      setState({ status: 'ready', risks: await listRisks(), error: '' });
    } catch (err) {
      setState({ status: 'error', risks: [], error: err.message || 'Could not load the risk register.' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.risks
      .filter((r) => (statusFilter === 'ACTIVE' ? r.status !== 'CLOSED' : statusFilter === 'ALL' || r.status === statusFilter))
      .filter((r) => !levelFilter || r.residualLevel === levelFilter)
      .filter(
        (r) =>
          !needle ||
          [r.code, r.title, r.category, r.businessService, r.owner].some((f) => (f || '').toLowerCase().includes(needle)),
      )
      .sort(SORTS[sort] || SORTS.residual);
  }, [state.risks, q, statusFilter, levelFilter, sort]);

  const hasSample = state.risks.some((r) => r.sample);

  async function save(body) {
    if (editing === 'new') {
      const created = await createRisk(body);
      setNotice(`${created.code} created.`);
    } else {
      const updated = await updateRisk(editing.id, body);
      setNotice(`${updated.code} saved.`);
    }
    setEditing(null);
    await load();
  }

  async function remove() {
    const code = editing.code;
    await deleteRisk(editing.id);
    setEditing(null);
    setNotice(`${code} deleted.`);
    await load();
  }

  async function exportCsv() {
    setExporting(true);
    try {
      await downloadRiskCsv();
    } catch (err) {
      setNotice('');
      setState((s) => ({ ...s, error: err.message || 'Export failed.' }));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="page page--wide" aria-labelledby="risks-title">
      <header className="dash-head">
        <div>
          <h1 id="risks-title" className="page__title">
            Risk register
          </h1>
          <p className="muted">Every identified risk with its inherent and residual exposure, treatment and owner.</p>
        </div>
        <div className="dash-actions">
          <Button variant="secondary" className="btn btn--secondary btn--sm" onClick={exportCsv} loading={exporting}>
            Export CSV
          </Button>
          {canEdit && (
            <Button id="new-risk" className="btn btn--primary btn--sm" onClick={() => setEditing('new')}>
              New risk
            </Button>
          )}
        </div>
      </header>

      {hasSample && (
        <Alert variant="info">
          Showing <strong>sample data</strong> for demonstration. Rows marked “Sample” will be replaced by your real register.
        </Alert>
      )}
      {notice && <Alert variant="success">{notice}</Alert>}
      {state.error && state.status === 'ready' && <Alert>{state.error}</Alert>}

      <div className="card panel">
        <div className="filters" role="search">
          <input
            type="search"
            className="text-input filters__search"
            placeholder="Search code, title, service, owner…"
            aria-label="Filter risks"
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
          />
          <select className="select-input filters__select" aria-label="Status" value={statusFilter} onChange={(e) => setParam('status', e.target.value === 'ACTIVE' ? '' : e.target.value)}>
            <option value="ACTIVE">Active (open + in progress)</option>
            <option value="ALL">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select className="select-input filters__select" aria-label="Residual level" value={levelFilter} onChange={(e) => setParam('level', e.target.value)}>
            <option value="">Any residual level</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
          <select className="select-input filters__select" aria-label="Sort by" value={sort} onChange={(e) => setParam('sort', e.target.value === 'residual' ? '' : e.target.value)}>
            <option value="residual">Highest residual first</option>
            <option value="inherent">Highest inherent first</option>
            <option value="newest">Newest first</option>
            <option value="code">Code</option>
          </select>
        </div>

        {state.status === 'loading' && (
          <div className="card--center">
            <Spinner size={24} label="Loading risks" />
          </div>
        )}
        {state.status === 'error' && (
          <div className="stack">
            <Alert>{state.error}</Alert>
            <Button variant="secondary" onClick={load}>
              Try again
            </Button>
          </div>
        )}
        {state.status === 'ready' && (
          <>
            <p className="muted filters__count" aria-live="polite">
              {visible.length} of {state.risks.length} risks
            </p>
            {visible.length === 0 ? (
              <p className="muted empty-note">No risks match these filters.</p>
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
                      <th>Status</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <button type="button" className="link-btn risk-code" onClick={() => setEditing(r)} aria-label={`${canEdit ? 'Edit' : 'View'} ${r.code}`}>
                            {r.code}
                          </button>
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
                          <LevelBadge level={r.inherentLevel} score={r.inherentScore} />
                        </td>
                        <td>
                          <LevelBadge level={r.residualLevel} score={r.residualScore} />
                        </td>
                        <td>
                          <TreatmentTag treatment={r.treatment} />
                        </td>
                        <td>
                          <StatusText status={r.status} />
                        </td>
                        <td className="muted">{r.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {editing && (
        <RiskFormModal
          risk={editing === 'new' ? null : editing}
          canEdit={canEdit}
          onClose={() => setEditing(null)}
          onSave={save}
          onDelete={remove}
        />
      )}
    </section>
  );
}
