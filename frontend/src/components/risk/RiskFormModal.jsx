import { useEffect, useRef, useState } from 'react';
import Alert from '../Alert';
import Button from '../Button';
import { LevelBadge } from './RiskBits';
import { CATEGORIES, STATUSES, STATUS_LABELS, TREATMENTS, TREATMENT_LABELS, levelOf } from '../../utils/risk';

const EMPTY = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  businessService: '',
  owner: '',
  likelihood: 3,
  impact: 3,
  residualLikelihood: 2,
  residualImpact: 2,
  treatment: 'MITIGATE',
  status: 'OPEN',
};

const SCALE = [
  [1, '1 · Very low'],
  [2, '2 · Low'],
  [3, '3 · Medium'],
  [4, '4 · High'],
  [5, '5 · Very high'],
];

function ScoreSelect({ id, label, value, onChange, disabled }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <select id={id} className="select-input" value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled}>
        {SCALE.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Create / edit / view a risk. `canEdit` false renders the same form read-only.
 * onSave(body) and onDelete() return promises; errors are shown inline.
 */
export default function RiskFormModal({ risk, canEdit, onClose, onSave, onDelete }) {
  const [values, setValues] = useState(() => (risk ? { ...EMPTY, ...risk, description: risk.description || '' } : EMPTY));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(null);
  const firstField = useRef(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const set = (field) => (v) => setValues((s) => ({ ...s, [field]: v?.target ? v.target.value : v }));
  const inherent = values.likelihood * values.impact;
  const residual = values.residualLikelihood * values.residualImpact;
  const readOnly = !canEdit || busy !== null;

  function validate() {
    const e = {};
    if (!values.title.trim()) e.title = 'Title is required';
    if (!values.businessService.trim()) e.businessService = 'Business service is required';
    if (!values.owner.trim()) e.owner = 'Owner is required';
    if (residual > inherent) e.residual = 'Residual risk cannot be higher than inherent risk';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy('save');
    try {
      const { title, description, category, businessService, owner, likelihood, impact, residualLikelihood, residualImpact, treatment, status } = values;
      await onSave({ title, description, category, businessService, owner, likelihood, impact, residualLikelihood, residualImpact, treatment, status });
    } catch (err) {
      setServerError(err.message || 'The risk could not be saved.');
      setBusy(null);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${risk.code}? This cannot be undone.`)) return;
    setBusy('delete');
    try {
      await onDelete();
    } catch (err) {
      setServerError(err.message || 'The risk could not be deleted.');
      setBusy(null);
    }
  }

  const title = !risk ? 'New risk' : canEdit ? `Edit ${risk.code}` : risk.code;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="risk-modal-title">
      <form className="modal-card modal-card--wide" onSubmit={submit} noValidate>
        <div className="modal-card__header">
          <h2 id="risk-modal-title" className="card__title">
            {title}
          </h2>
          <button type="button" className="link-btn modal-close" aria-label="Close" onClick={onClose} disabled={busy !== null}>
            &times;
          </button>
        </div>

        {serverError && <Alert>{serverError}</Alert>}

        <div className="form risk-form">
          <div className="field risk-form__full">
            <label htmlFor="risk-title" className="field__label">
              Title
            </label>
            <input id="risk-title" ref={firstField} className="text-input" value={values.title} onChange={set('title')} disabled={readOnly} maxLength={200} aria-invalid={!!errors.title} />
            {errors.title && <span className="field__error">{errors.title}</span>}
          </div>

          <div className="field risk-form__full">
            <label htmlFor="risk-description" className="field__label">
              Description
            </label>
            <textarea id="risk-description" className="text-input text-input--area" rows={3} value={values.description} onChange={set('description')} disabled={readOnly} maxLength={2000} />
          </div>

          <div className="field">
            <label htmlFor="risk-category" className="field__label">
              Category
            </label>
            <select id="risk-category" className="select-input" value={values.category} onChange={set('category')} disabled={readOnly}>
              {[...new Set([...CATEGORIES, values.category])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="risk-service" className="field__label">
              Business service
            </label>
            <input id="risk-service" className="text-input" value={values.businessService} onChange={set('businessService')} disabled={readOnly} maxLength={120} aria-invalid={!!errors.businessService} />
            {errors.businessService && <span className="field__error">{errors.businessService}</span>}
          </div>

          <div className="field">
            <label htmlFor="risk-owner" className="field__label">
              Risk owner
            </label>
            <input id="risk-owner" className="text-input" value={values.owner} onChange={set('owner')} disabled={readOnly} maxLength={120} aria-invalid={!!errors.owner} />
            {errors.owner && <span className="field__error">{errors.owner}</span>}
          </div>

          <div className="field">
            <label htmlFor="risk-treatment" className="field__label">
              Treatment
            </label>
            <select id="risk-treatment" className="select-input" value={values.treatment} onChange={set('treatment')} disabled={readOnly}>
              {TREATMENTS.map((t) => (
                <option key={t} value={t}>
                  {TREATMENT_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="score-box">
            <legend>
              Inherent risk <LevelBadge level={levelOf(inherent)} score={inherent} />
            </legend>
            <ScoreSelect id="risk-likelihood" label="Likelihood" value={values.likelihood} onChange={set('likelihood')} disabled={readOnly} />
            <ScoreSelect id="risk-impact" label="Impact" value={values.impact} onChange={set('impact')} disabled={readOnly} />
          </fieldset>

          <fieldset className="score-box">
            <legend>
              Residual risk <LevelBadge level={levelOf(residual)} score={residual} />
            </legend>
            <ScoreSelect id="risk-res-likelihood" label="Likelihood" value={values.residualLikelihood} onChange={set('residualLikelihood')} disabled={readOnly} />
            <ScoreSelect id="risk-res-impact" label="Impact" value={values.residualImpact} onChange={set('residualImpact')} disabled={readOnly} />
          </fieldset>
          {errors.residual && <span className="field__error risk-form__full">{errors.residual}</span>}

          <div className="field">
            <label htmlFor="risk-status" className="field__label">
              Status
            </label>
            <select id="risk-status" className="select-input" value={values.status} onChange={set('status')} disabled={readOnly}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          {risk && canEdit && (
            <Button type="button" variant="ghost" className="btn btn--ghost btn--danger" onClick={remove} loading={busy === 'delete'} disabled={busy !== null}>
              Delete
            </Button>
          )}
          <span className="modal-actions__spacer" />
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy !== null}>
            {canEdit ? 'Cancel' : 'Close'}
          </Button>
          {canEdit && (
            <Button type="submit" loading={busy === 'save'} disabled={busy !== null}>
              {risk ? 'Save changes' : 'Create risk'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
