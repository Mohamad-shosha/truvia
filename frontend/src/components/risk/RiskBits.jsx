import { LEVEL_LABELS, STATUS_LABELS, TREATMENT_LABELS } from '../../utils/risk';

/** Severity pill: colour + icon-like marker + text, never colour alone. */
export function LevelBadge({ level, score }) {
  return (
    <span className={`lvl-badge lvl-badge--${level.toLowerCase()}`}>
      <span className="lvl-badge__mark" aria-hidden="true" />
      {LEVEL_LABELS[level]}
      {score != null && <span className="lvl-badge__score">{score}</span>}
    </span>
  );
}

export function StatusText({ status }) {
  return <span className={`risk-status risk-status--${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}

export function TreatmentTag({ treatment }) {
  return <span className="tag">{TREATMENT_LABELS[treatment]}</span>;
}

export function SampleTag() {
  return (
    <span className="tag tag--sample" title="Sample data seeded for demonstration">
      Sample
    </span>
  );
}
