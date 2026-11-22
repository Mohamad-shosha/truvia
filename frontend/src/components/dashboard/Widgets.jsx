import { Link } from 'react-router-dom';
import { roleLabel, formatRelative } from '../../utils/format';
import { ArrowIcon, ClockIcon } from '../icons';

/** One headline number. `tone` tints only the small marker, never the value text. */
export function StatCard({ label, value, hint, tone, id }) {
  return (
    <div className="stat" id={id}>
      <span className="stat__label">
        {tone && <span className={`stat__dot stat__dot--${tone}`} aria-hidden="true" />}
        {label}
      </span>
      <span className="stat__value">{value}</span>
      {hint && <span className="stat__hint">{hint}</span>}
    </div>
  );
}

/** Section card with a title row and optional action on the right. */
export function Panel({ title, subtitle, action, children, className = '', id }) {
  return (
    <section className={`card panel ${className}`} aria-labelledby={id ? `${id}-title` : undefined} id={id}>
      <header className="panel__head">
        <div>
          <h2 className="card__title" id={id ? `${id}-title` : undefined}>
            {title}
          </h2>
          {subtitle && <p className="panel__sub muted">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Horizontal magnitude bars, one hue, every bar direct-labeled with its count. */
export function RoleBars({ items, unit = 'accounts' }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="rolebars" aria-label={`Accounts per role`}>
      {items.map((item) => (
        <li key={item.role} className="rolebars__row">
          <span className="rolebars__label">{roleLabel(item.role)}</span>
          <span className="rolebars__track" aria-hidden="true">
            {item.count > 0 && (
              <span className="rolebars__fill" style={{ width: `${(item.count / max) * 100}%` }} />
            )}
          </span>
          <span className="rolebars__count">
            {item.count}
            <span className="sr-only"> {unit}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Compact list of people with a secondary line. */
export function PeopleList({ people, empty, secondary }) {
  if (!people.length) return <p className="muted empty-note">{empty}</p>;
  return (
    <ul className="people">
      {people.map((p) => (
        <li key={p.id} className="people__row">
          <span className="people__avatar" aria-hidden="true">
            {p.fullName.charAt(0).toUpperCase()}
          </span>
          <span className="people__main">
            <strong>{p.fullName}</strong>
            <span className="muted">{secondary(p)}</span>
          </span>
          <span className="badges">
            {p.roles.map((r) => (
              <span key={r} className="badge badge--sm">
                {roleLabel(r)}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Platform modules for the user's roles: available ones link, planned ones show their roadmap phase. */
export function ModuleGrid({ modules }) {
  return (
    <ul className="modules">
      {modules.map((m) => (
        <li key={m.key} className={`module module--${m.status.toLowerCase()}`} data-module={m.key}>
          <div className="module__top">
            <h3 className="module__title">{m.title}</h3>
            {m.status === 'AVAILABLE' ? (
              <span className="pill pill--ok">Available</span>
            ) : (
              <span className="pill">
                <ClockIcon width={13} height={13} /> {m.plannedFor}
              </span>
            )}
          </div>
          <p className="module__desc muted">{m.description}</p>
          {m.status === 'AVAILABLE' && (
            <Link to={m.path} className="module__link">
              Open <ArrowIcon width={15} height={15} />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Placeholder for an executive KPI whose data source ships in a later phase. */
export function PlannedKpi({ title, phase }) {
  return (
    <div className="stat stat--planned">
      <span className="stat__label">{title}</span>
      <span className="stat__value stat__value--planned">—</span>
      <span className="stat__hint">Arrives with {phase}</span>
    </div>
  );
}

export const lastSeen = (p) => (p.lastLoginAt ? `Last sign-in ${formatRelative(p.lastLoginAt)}` : 'Never signed in');
