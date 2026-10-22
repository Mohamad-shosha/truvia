export default function Logo({ size = 40, withWordmark = true }) {
  return (
    <span className="logo" aria-label="TRUVIA">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4ade80" />
            <stop offset="1" stopColor="#15803d" />
          </linearGradient>
        </defs>
        <path d="M6 10h52L32 58z" fill="url(#logo-g)" />
        <path d="M20 19h24L32 40z" fill="var(--logo-inner, #fff)" />
        <circle cx="32" cy="27" r="2.6" fill="#15803d" />
      </svg>
      {withWordmark && <span className="logo__word">TRUVIA</span>}
    </span>
  );
}
