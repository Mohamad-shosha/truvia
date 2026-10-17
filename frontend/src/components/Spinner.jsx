export default function Spinner({ size = 24, label }) {
  return (
    <span className="spinner" role={label ? 'status' : undefined} aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function FullPageSpinner({ label = 'Loading' }) {
  return (
    <div className="fullpage-center">
      <Spinner size={36} label={label} />
    </div>
  );
}
