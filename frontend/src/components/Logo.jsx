export default function Logo({ size = 40, withWordmark = true }) {
  return (
    <span className="logo" aria-label="TRUVIA">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M 12 14 H 52 C 55.5 14 57.5 17.8 55.6 20.8 L 35.6 52.8 C 33.8 55.7 29.8 55.7 28.0 52.8 L 8.4 20.8 C 6.5 17.8 8.5 14 12 14 Z"
          stroke="var(--primary, #16a34a)"
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        <line
          x1="32"
          y1="23"
          x2="32"
          y2="36"
          stroke="var(--primary, #16a34a)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle
          cx="32"
          cy="44"
          r="2.8"
          fill="var(--primary, #16a34a)"
        />
      </svg>
      {withWordmark && <span className="logo__word">TRUVIA</span>}
    </span>
  );
}
