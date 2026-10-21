export default function Logo({ size = 40, withWordmark = true, className = '' }) {
  return (
    <span className={`logo ${className}`.trim()} aria-label="TRUVIA">
      <svg
        className="logo__mark"
        width={(size * 48) / 42}
        height={size}
        viewBox="0 0 48 42"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3fd57f" />
            <stop offset="1" stopColor="#12934a" />
          </linearGradient>
        </defs>
        <path
          d="M9 6H39C41.5 6 43 8.6 41.7 10.8L26.7 35.3C25.5 37.2 22.5 37.2 21.3 35.3L6.3 10.8C5 8.6 6.5 6 9 6Z"
          stroke="url(#logo-g)"
          strokeWidth="6.5"
          strokeLinejoin="round"
        />
        <path d="M24 13.5V22" stroke="#22b862" strokeWidth="4.2" strokeLinecap="round" />
        <circle cx="24" cy="27.3" r="2.2" fill="#22b862" />
      </svg>
      {withWordmark && <span className="logo__word">TRUVIA</span>}
    </span>
  );
}
