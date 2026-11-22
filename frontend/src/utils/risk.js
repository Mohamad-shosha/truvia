export const LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
export const LEVEL_LABELS = { CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
export const STATUS_LABELS = { OPEN: 'Open', IN_PROGRESS: 'In progress', CLOSED: 'Closed' };

export const TREATMENTS = ['MITIGATE', 'ACCEPT', 'TRANSFER', 'AVOID'];
export const TREATMENT_LABELS = { MITIGATE: 'Mitigate', ACCEPT: 'Accept', TRANSFER: 'Transfer', AVOID: 'Avoid' };

export const CATEGORIES = [
  'Threat & AI Security',
  'Ransomware & Malware',
  'Supply Chain',
  'Identity & IAM',
  'Cloud Security',
  'Vulnerability Management',
  'Data Protection',
  'Fraud & Social Engineering',
  'Third-Party',
  'Compliance',
  'Availability',
  'Operational',
  'Physical Security',
];

/** Same banding as the backend: 1-4 low, 5-9 medium, 10-15 high, 16-25 critical. */
export function levelOf(score) {
  if (score >= 16) return 'CRITICAL';
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}

/** "+12%" / "-5%" / null when there is no baseline. */
export function percentChange(now, previous) {
  if (previous == null || previous === 0) return null;
  return Math.round(((now - previous) / previous) * 100);
}
