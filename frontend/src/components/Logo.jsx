export default function Logo({ size = 40, withWordmark = true }) {
  return (
    <span className="logo" aria-label="TRUVIA">
      <img
        className="logo__mark"
        src="/truvia-brand-mark.png"
        alt=""
        width={size}
        height={size}
      />
      {withWordmark && <span className="logo__word">TRUVIA</span>}
    </span>
  );
}
