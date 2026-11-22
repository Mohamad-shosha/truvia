export const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrator',
  ROLE_CISO: 'CISO',
  ROLE_GRC_ANALYST: 'GRC Analyst',
  ROLE_SOC_ANALYST: 'SOC Analyst',
  ROLE_PENTESTER: 'Penetration Tester',
};

export const roleLabel = (role) => ROLE_LABELS[role] || role;

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "5 minutes ago", "in 3 days", "just now". Returns `fallback` for empty input. */
export function formatRelative(iso, { now = Date.now(), fallback = '—' } = {}) {
  if (!iso) return fallback;
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (Math.abs(seconds) < 45) return 'just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(Math.round(seconds / 60), 'minute');
}

/** "22 Nov 2026, 14:05" in the viewer's locale and time zone. */
export function formatDateTime(iso, fallback = '—') {
  if (!iso) return fallback;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

/** "22 Nov 2026". */
export function formatDate(iso, fallback = '—') {
  if (!iso) return fallback;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso));
}

/** "Nov 22" for a YYYY-MM-DD calendar date (UTC day from the API, shown as that same day). */
export function formatShortDay(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export const firstName = (fullName = '') => fullName.trim().split(/\s+/)[0] || fullName;
